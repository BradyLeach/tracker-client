/**
 * Shredder
 *
 * Takes a response tree and writes each nested record into the table for its own model,
 * driven by the association descriptors ModelRegistry loads at bootstrap.
 *
 * It lives in the DataService layer and is written once. Shredding in every domain service
 * would put the same tree walk, the same staleness guard and the same tombstone check in
 * twenty places, each free to get one of them wrong.
 */

import { getConfig } from '@/config';
import { logger } from '@/core/utils/logger';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { dataStore } from '@/services/dataStore/dataStore';
import type { EntityRecord } from '@/services/dataStore/dataStore';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

export interface ShredOptions
{
    /**
     * A mutation response, applying the actor's own write to their own screen.
     *
     * A failed store write propagates to the caller rather than being logged: REST has
     * already succeeded, so a swallowed failure leaves the screen showing a save that
     * appears to have done nothing. Background reads populating the store do not set this.
     */
    mutation?: boolean;

    /**
     * A create or restore. The ids it carries are no longer deleted, so their tombstones
     * clear in the same operation. Soft delete makes restore a real path, and without this
     * a restore would silently do nothing.
     */
    restores?: boolean;
}

/** Records collected for one model during a walk, keyed by id so a tree cannot write twice. */
type ModelBucket = Map<string, EntityRecord>;

// <=======================================================================>
// <===============================> STATE <===============================>
// <=======================================================================>

/**
 * Deleted ids and the moment their guard expires.
 *
 * In memory only: after a refresh there are no pre-refresh requests to guard against.
 * Uuid keys mean a tombstone can never block an unrelated record.
 */
const tombstones = new Map<string, number>();

// A tombstone guards an id in the store, so its lifetime is the store's. When the store is
// destroyed those ids name records in a database that no longer exists. They would expire
// on their own, so this is not a correctness fix — but the guard has one lifetime and it
// belongs in one place, next to the state rather than in whoever remembers to call it.
dataStore.onSessionEnd( () => tombstones.clear() );

/**
 * Serialises shredding, so two responses landing together cannot interleave a read of the
 * stored record with the other's write and defeat the staleness guard.
 */
let queue: Promise<void> = Promise.resolve();

// <=======================================================================>
// <=============================> TOMBSTONES <============================>
// <=======================================================================>

/**
 * How long a tombstone guards an id.
 *
 * No response outlives the request that produced it, so the HTTP timeout is the longest a
 * pre-delete response can still be in flight.
 */
function tombstoneLifetime(): number
{
    return getConfig().apiConfig.timeout;
}

/**
 * Marks ids as deleted so an in-flight response cannot write them back.
 *
 * Every id in a delete set is tombstoned, not just the one the client sent, so cascaded
 * children are covered by the same mechanism. Deletes learned from the event stream come
 * through here too — the race does not care how the removal was learned.
 */
export function tombstone( ids: readonly string[] ): void
{
    const expiresAt = Date.now() + tombstoneLifetime();
    ids.forEach( id => tombstones.set( id, expiresAt ) );
}

/** Clears tombstones for ids that have come back, on a restore or a create. */
export function clearTombstones( ids: readonly string[] ): void
{
    ids.forEach( id => tombstones.delete( id ) );
}

function isTombstoned( id: string ): boolean
{
    const expiresAt = tombstones.get( id );
    if( expiresAt === undefined ) return false;

    if( expiresAt <= Date.now() )
    {
        tombstones.delete( id );
        return false;
    }

    return true;
}

// <=======================================================================>
// <=============================> THE WALK <==============================>
// <=======================================================================>

function isRecord( value: unknown ): value is Record<string, unknown>
{
    return typeof value === 'object' && value !== null && !Array.isArray( value );
}

/**
 * Walks a node of the response tree, flattening it into `buckets` and recursing into every
 * association alias it carries.
 *
 * @param node - The value found at this point in the tree.
 * @param model - Model the node describes; the caller knows what it requested.
 * @param buckets - Collected records, keyed by model then by id.
 * @param extraAliases - Aliases beyond the model's own descriptors, keyed to their model.
 *        Used for the join row a many-to-many hangs off each target record.
 */
function walk(
    node: unknown,
    model: string,
    buckets: Map<string, ModelBucket>,
    extraAliases: Record<string, string> = {}
): void
{
    if( Array.isArray( node ) )
    {
        node.forEach( element => walk( element, model, buckets, extraAliases ) );
        return;
    }

    if( !isRecord( node ) ) return;

    const definition = modelRegistry.get( model );
    if( !definition ) return;

    const associations = definition.associations ?? {};
    const flat: Record<string, unknown> = {};
    let ownFieldCount = 0;

    for( const [key, value] of Object.entries( node ) )
    {
        const association = associations[key];
        const nestedModel = association?.target ?? extraAliases[key];

        if( !nestedModel )
        {
            // An ordinary field, including arrays of scalars — recursion is keyed off the
            // edge map, so nothing that is not a declared association is treated as one.
            flat[key] = value;
            if( key !== 'id' ) ownFieldCount += 1;
            continue;
        }

        const nestedAliases = association?.via ? { [association.via]: association.via } : {};
        walk( value, nestedModel, buckets, nestedAliases );
    }

    const id = node.id;
    if( typeof id !== 'string' || id === '' ) return;

    // A nested reference carrying only { id } is a pointer, not a record. Writing it would
    // overwrite the fuller record already held.
    if( ownFieldCount === 0 ) return;

    const bucket = buckets.get( model ) ?? new Map<string, EntityRecord>();
    bucket.set( id, { ...flat, id } );
    buckets.set( model, bucket );
}

// <=======================================================================>
// <=============================> THE GUARDS <============================>
// <=======================================================================>

function timestampOf( record: EntityRecord | undefined ): number | undefined
{
    const value = record?.updatedAt;
    if( typeof value !== 'string' && typeof value !== 'number' ) return undefined;

    const parsed = new Date( value ).getTime();
    return Number.isNaN( parsed ) ? undefined : parsed;
}

/**
 * True when the incoming record is older than the one already stored.
 *
 * Two requests in flight can land out of order, and without this a stale response silently
 * overwrites newer data. Models that opt out of timestamps have no guard and must not.
 */
function isStale( incoming: EntityRecord, stored: EntityRecord | undefined ): boolean
{
    const incomingAt = timestampOf( incoming );
    const storedAt = timestampOf( stored );

    if( incomingAt === undefined || storedAt === undefined ) return false;

    return incomingAt < storedAt;
}

/**
 * Applies the guards to one model's records and writes what survives.
 *
 * Records are written as received. Dawnshard authorised the request and field-shaped the
 * response before it left the server, so nothing here re-decides what the actor may hold.
 * The one shape hazard — a projected record replacing a whole one — is kept out by the rule
 * that no endpoint the frontend consumes may project, not by a check at this point.
 */
async function writeBucket( model: string, bucket: ModelBucket ): Promise<void>
{
    const candidates = [...bucket.values()].filter( record => !isTombstoned( record.id ) );
    if( candidates.length === 0 ) return;

    const stored = await dataStore.read<EntityRecord>( model, candidates.map( record => record.id ) );
    const storedById = new Map( stored.map( record => [record.id, record] ) );

    // A delete can land while the stored records are read, so check the tombstone again immediately before writing.
    const writable = candidates.filter( record =>
        !isTombstoned( record.id ) && !isStale( record, storedById.get( record.id ) ) );

    if( writable.length === 0 ) return;

    await dataStore.write( model, writable );
}

// <=======================================================================>
// <==============================> PUBLIC API <===========================>
// <=======================================================================>

/**
 * Writes every bucket, deciding what a failed write means for the caller.
 *
 * A mutation response is the actor's own write applying synchronously to their own screen:
 * if the store rejects it, REST has succeeded, no observer re-emits and the save appears to
 * do nothing, so the failure has to reach the caller. An incidental read populating the
 * store in the background has no such contract and continues.
 */
async function writeBuckets( buckets: Map<string, ModelBucket>, options: ShredOptions ): Promise<void>
{
    for( const [model, bucket] of buckets )
    {
        try
        {
            await writeBucket( model, bucket );
        }
        catch ( error )
        {
            logger.error( 'Shredder → could not store records', { model, error } );

            if( options.mutation ) throw error;
        }
    }
}

/**
 * Shreds a response tree into the store.
 *
 * @param payload - The response data: one record or an array of them.
 * @param rootModel - Model the payload describes; the caller knows what it requested.
 * @param options - Mutation and restore semantics for this response.
 *
 * @example
 * // GET /business/companies/:id?includes=partnership
 * await shred( response.data, 'company' );
 * // → company and partnership stored flat, each with its own foreign keys
 */
export function shred( payload: unknown, rootModel: string, options: ShredOptions = {} ): Promise<void>
{
    const buckets = new Map<string, ModelBucket>();
    walk( payload, rootModel, buckets );

    // Only what the operation actually restored. A create or restore response carrying a
    // nested company did not restore that company, and clearing its tombstone would reopen
    // the very race the tombstone is holding shut.
    if( options.restores )
    {
        clearTombstones( [...( buckets.get( rootModel )?.keys() ?? [] )] );
    }

    // Chained rather than awaited in place: a read-then-write interleaved with another
    // response's write would defeat the staleness guard it exists to enforce.
    const work = queue.then( () => writeBuckets( buckets, options ) );

    // The chain survives a rejection; only the caller that owns the failure sees it.
    queue = work.catch( () => undefined );

    return work;
}
