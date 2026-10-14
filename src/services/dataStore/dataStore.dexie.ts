/**
 * DataStore - Dexie Adapter
 *
 * The only module in the application that imports `dexie`. Everything engine-specific is
 * owned here and none of it crosses the boundary: table declaration, indexing, database
 * naming and versioning, query translation and teardown.
 *
 * Enforced by `no-restricted-imports` in eslint.config.js, not by convention.
 *
 * The store is a flat cache of records Dawnshard has already validated. Dexie stores whatever
 * fields a record carries, so only the primary key and the indexed foreign keys are declared —
 * a field-type mapper here would be a second description of the model to keep in sync by hand.
 * Validation lives in ModelRegistry and Yup.
 */

import Dexie, { liveQuery } from 'dexie';
import type { BulkError, Collection, Table } from 'dexie';
import { from, map } from 'rxjs';
import type { Observable } from 'rxjs';

import { logger } from '@/core/utils/logger';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { ModelDefinition } from '@/core/models/types';
import type { DataStore, EntityRecord, Keyed, Stream, Where, WhereComparison, WhereScalar } from './dataStore.types';

// <=======================================================================>
// <===============================> CONSTANTS <===========================>
// <=======================================================================>

/** localStorage key holding every database name this origin has created. */
const DATABASE_INDEX_KEY = 'trkc.dataStore.databases';

/** Channel carrying session events between tabs on this origin. */
const SESSION_CHANNEL_NAME = 'trkc.dataStore.session';

/** Broadcast asking every other tab to close its connection so the database can be deleted. */
const SESSION_CLOSE_MESSAGE = 'close';

/**
 * The only schema version there will ever be.
 *
 * A model shape change produces a new database name rather than an upgrade, so Dexie version
 * upgrades are not used and must not be introduced.
 */
const SCHEMA_VERSION = 1;

/**
 * Table holding scope records — what the store holds *completely*, as opposed to what it
 * merely holds. Named with a leading underscore so it cannot collide with a model.
 */
export const SCOPE_TABLE = '_scope';

/**
 * How long a delete is waited on before logout gives up on it.
 *
 * The delete resolving is the real signal, not a clock — but a sibling tab that is frozen,
 * throttled in the background or mid-crash never processes the broadcast and never closes,
 * and an unbounded wait leaves the user logged out of nothing with no feedback. The request
 * is not cancelled by giving up; it completes whenever those connections finally close.
 */
const DELETE_TIMEOUT_MS = 5000;

// <=======================================================================>
// <===============================> STATE <===============================>
// <=======================================================================>

let database: Dexie | undefined;
let sessionChannel: BroadcastChannel | undefined;
const sessionEndHandlers = new Set<() => void>();

/** Indexed fields per model, kept for the lifetime of the open database to plan queries. */
let indexedFields: Record<string, Set<string>> = {};

// <=======================================================================>
// <=========================> TABLES AND INDEXES <========================>
// <=======================================================================>

/**
 * Collects, for every model, the fields that hold a foreign key.
 *
 * The edge is declared on one side only, so this walks the whole graph rather than one
 * definition: a `belongsTo` puts the key on the declaring model, a `hasMany` or `hasOne`
 * puts it on the target, and a `belongsToMany` puts both keys on the join model.
 *
 * @param definitions - Every loaded model definition, keyed by name.
 * @returns Foreign key field names keyed by the model that holds them.
 */
function foreignKeyFields( definitions: Record<string, ModelDefinition> ): Record<string, Set<string>>
{
    const keys: Record<string, Set<string>> = {};

    const add = ( model: string, field: string | undefined ) =>
    {
        if( !field || !definitions[model]?.schema?.[field] ) return;
        keys[model] ??= new Set<string>();
        keys[model].add( field );
    };

    for( const [modelName, definition] of Object.entries( definitions ) )
    {
        for( const association of Object.values( definition.associations ?? {} ) )
        {
            switch ( association.type )
            {
                case 'belongsTo':
                    add( modelName, association.foreignKey );
                    break;

                case 'hasOne':
                case 'hasMany':
                    add( association.target, association.foreignKey );
                    break;

                case 'belongsToMany':
                    add( association.via ?? '', association.foreignKey );
                    add( association.via ?? '', association.otherKey );
                    break;
            }
        }
    }

    return keys;
}

/**
 * Builds the Dexie store declaration: one table per model, `id` as primary key, that model's
 * foreign keys as indexes. Everything else a record carries is stored without being declared.
 */
function storeDeclaration( definitions: Record<string, ModelDefinition>, indexes: Record<string, Set<string>> )
    : Record<string, string>
{
    return {
        ...Object.fromEntries(
            Object.keys( definitions ).map( modelName => [
                modelName,
                ['id', ...( indexes[modelName] ?? [] )].join( ', ' )
            ] )
        ),

        // Fixed, not generated. Scope is persisted alongside the entities it describes,
        // because a store that survives a refresh has to remember what it holds completely
        // as well as what it holds. Keyed by canonical filter and indexed by model, so a
        // domain can read every scope it owns. Deliberately absent from modelShapeHash: a
        // change to this table's shape is not a change to the model shapes.
        [SCOPE_TABLE]: 'id, model'
    };
}

// <=======================================================================>
// <=========================> NAMING AND VERSIONING <=====================>
// <=======================================================================>

/**
 * FNV-1a, 32-bit. Not a security hash — it only has to change when the model shapes change.
 */
function hashOf( input: string ): string
{
    let hash = 0x811c9dc5;

    for( let index = 0; index < input.length; index += 1 )
    {
        hash ^= input.charCodeAt( index );
        hash = Math.imul( hash, 0x01000193 );
    }

    return ( hash >>> 0 ).toString( 16 );
}

/**
 * A stable fingerprint of the loaded model shapes.
 *
 * Field order from the endpoint is not guaranteed, so names are sorted before hashing —
 * an unsorted fingerprint would rebuild the store on a meaningless reordering.
 */
function modelShapeHash( definitions: Record<string, ModelDefinition> ): string
{
    const shape = Object.keys( definitions ).sort().map( modelName =>
    {
        const definition = definitions[modelName];
        const fields = Object.entries( definition.schema ?? {} )
            .map( ( [fieldName, field] ) => `${fieldName}:${field.type}` )
            .sort();
        const edges = Object.entries( definition.associations ?? {} )
            .map( ( [alias, edge] ) => `${alias}:${edge.type}:${edge.target}:${edge.foreignKey}` )
            .sort();

        return `${modelName}|${fields.join( ',' )}|${edges.join( ',' )}`;
    } );

    return hashOf( shape.join( '\n' ) );
}

/**
 * Profile-scoped, model-shape-versioned database name.
 *
 * A profile belongs to exactly one account, so profile scoping is account scoping.
 * A changed hash means a new database, which is why there is no migration path.
 */
function databaseName( profileId: string, definitions: Record<string, ModelDefinition> ): string
{
    const scope = profileId.toLowerCase().replace( /[^a-z0-9-]/g, '' );
    return `trkc-${scope}-${modelShapeHash( definitions )}`;
}

// <=======================================================================>
// <==========================> THE DATABASE INDEX <=======================>
// <=======================================================================>

/**
 * Reads the names of every database this origin has created.
 *
 * A local index rather than `indexedDB.databases()`, which is not available everywhere.
 * Without it, dropping "this profile's database" cannot reach one orphaned by a different
 * profile whose tab was killed, or by an earlier schema hash.
 */
function readDatabaseIndex(): string[]
{
    try
    {
        const raw = window.localStorage.getItem( DATABASE_INDEX_KEY );
        const parsed = raw ? JSON.parse( raw ) : [];
        return Array.isArray( parsed ) ? parsed.filter( ( name ): name is string => typeof name === 'string' ) : [];
    }
    catch
    {
        return [];
    }
}

function writeDatabaseIndex( names: string[] ): void
{
    try
    {
        window.localStorage.setItem( DATABASE_INDEX_KEY, JSON.stringify( [...new Set( names )] ) );
    }
    catch ( error )
    {
        logger.warn( 'DataStore → could not record database index', { error } );
    }
}

/**
 * Deletes a database, waiting on the delete itself rather than on a clock.
 *
 * `deleteDatabase` blocks while any tab holds an open connection and fires `blocked`; the
 * request still completes once those connections close, so the resolution of the delete is
 * the signal to wait for, not a grace period guessed in advance.
 *
 * The wait is bounded all the same, because a sibling that never closes would otherwise
 * hang logout forever. Giving up is logged, never thrown: logout must always finish.
 *
 * @returns True when the database is gone, false when the wait was abandoned.
 */
async function deleteDatabase( name: string ): Promise<boolean>
{
    const target = new Dexie( name );

    target.on( 'blocked', () =>
    {
        logger.warn( 'DataStore → delete blocked, waiting on open connections', { name } );
    } );

    let timer: ReturnType<typeof setTimeout> | undefined;

    const abandon = new Promise<'abandoned'>( resolve =>
    {
        timer = setTimeout( () => resolve( 'abandoned' ), DELETE_TIMEOUT_MS );
    } );

    try
    {
        const outcome = await Promise.race( [target.delete().then( () => 'deleted' as const ), abandon] );

        if( outcome === 'abandoned' )
        {
            logger.warn( 'DataStore → delete still blocked, abandoning the wait', { name } );
        }

        return outcome === 'deleted';
    }
    finally
    {
        clearTimeout( timer );
    }
}

/**
 * Deletes every recorded database except the one named, and rewrites the index.
 *
 * A name whose delete was abandoned or failed stays in the index. Forgetting it would make
 * it unreachable, since the index is the only record of what this origin has created.
 */
async function sweepStaleDatabases( keep?: string ): Promise<void>
{
    const stale = readDatabaseIndex().filter( name => name !== keep );
    const unswept: string[] = [];

    for( const name of stale )
    {
        try
        {
            const deleted = await deleteDatabase( name );

            if( deleted ) logger.debug( 'DataStore → swept stale database', { name } );
            else unswept.push( name );
        }
        catch ( error )
        {
            logger.warn( 'DataStore → could not sweep database', { name, error } );
            unswept.push( name );
        }
    }

    writeDatabaseIndex( keep ? [keep, ...unswept] : unswept );
}

// <=======================================================================>
// <=========================> CROSS-TAB SESSION EVENTS <==================>
// <=======================================================================>

/**
 * Opens the session channel once per tab.
 *
 * A tab receiving a close event drops its own connection so the originating tab can delete
 * the database; a delete blocks while any connection is open.
 */
function sessionChannelInstance(): BroadcastChannel | undefined
{
    if( sessionChannel ) return sessionChannel;
    if( typeof BroadcastChannel === 'undefined' ) return undefined;

    sessionChannel = new BroadcastChannel( SESSION_CHANNEL_NAME );
    sessionChannel.onmessage = ( event: MessageEvent ) =>
    {
        if( event.data !== SESSION_CLOSE_MESSAGE ) return;

        closeConnection();
        notifySessionEnd();
    };

    return sessionChannel;
}

/**
 * Tells every registered handler the session has ended.
 *
 * Raised in the tab that ended it as well as its siblings: a BroadcastChannel does not
 * deliver to the context that posted, and a hook that fired everywhere except where the
 * event originated would be a trap for anything holding state alongside the store.
 */
function notifySessionEnd(): void
{
    sessionEndHandlers.forEach( handler => handler() );
}

/** Closes this tab's connection, leaving the stored data untouched. */
function closeConnection(): void
{
    if( !database ) return;

    database.close();
    database = undefined;
    indexedFields = {};
}

// <=======================================================================>
// <==========================> QUERY TRANSLATION <========================>
// <=======================================================================>

function isComparison( value: unknown ): value is WhereComparison
{
    return typeof value === 'object' && value !== null && !Array.isArray( value );
}

function matches( record: EntityRecord, field: string, condition: WhereScalar | WhereComparison ): boolean
{
    return isComparison( condition )
        ? ( condition.anyOf ?? [] ).includes( record[field] as WhereScalar )
        : record[field] === condition;
}

/**
 * True when a condition can be handed to an index.
 *
 * `undefined` is not a valid IndexedDB key and Dexie throws on one, so a clause naming an id
 * that has not resolved yet — an ordinary state while a parent is still loading — is matched
 * over the records instead. It still means "field is undefined", it just cannot use the index.
 */
function isIndexable( condition: WhereScalar | WhereComparison ): boolean
{
    return isComparison( condition )
        ? !!condition.anyOf?.length && condition.anyOf.every( value => value !== undefined )
        : condition !== undefined;
}

/**
 * Translates the port's `where` vocabulary into a Dexie query.
 *
 * Two forms only, because the store serves entity lookups and edge traversal: a bare scalar
 * is equality, and `anyOf` is set membership. The first indexed field drives the query so the
 * traversal uses its index; anything left is applied as a filter over that result.
 */
function toQuery( table: Table<EntityRecord, string>, model: string, where: Where = {} )
    : Collection<EntityRecord, string> | Table<EntityRecord, string>
{
    const conditions = Object.entries( where );
    if( conditions.length === 0 ) return table;

    const indexes = indexedFields[model] ?? new Set<string>();
    const driving = conditions.find(
        ( [field, condition] ) => ( field === 'id' || indexes.has( field ) ) && isIndexable( condition )
    );

    const remaining = driving ? conditions.filter( entry => entry !== driving ) : conditions;

    let collection: Collection<EntityRecord, string>;

    if( driving )
    {
        const [field, condition] = driving;
        collection = isComparison( condition )
            ? table.where( field ).anyOf( ( condition.anyOf ?? [] ) as string[] )
            : table.where( field ).equals( condition as string );
    }
    else
    {
        collection = table.toCollection();
    }

    return remaining.length === 0
        ? collection
        : collection.filter( record => remaining.every( ( [field, condition] ) => matches( record, field, condition ) ) );
}

// <=======================================================================>
// <=============================> TABLE ACCESS <==========================>
// <=======================================================================>

function requireTable( model: string ): Table<EntityRecord, string>
{
    if( !database )
    {
        throw new Error( `DataStore: no open store. Open it before reading or writing '${model}'.` );
    }

    return database.table<EntityRecord, string>( model );
}

/**
 * Dexie's `liveQuery` returns its own interop observable. Converting it here is the last
 * engine-specific step before a value leaves the adapter as the port's `Stream`.
 */
function toStream<T>( querier: () => T | Promise<T> ): Stream<T>
{
    return from( liveQuery( querier ) as unknown as Observable<T> );
}

// <=======================================================================>
// <==============================> PUBLIC API <===========================>
// <=======================================================================>

export const dexieDataStore: DataStore = {

    async open( profileId: string ): Promise<void>
    {
        if( database ) return;

        // Session validity is the caller's concern. This adapter makes no network calls and
        // does not know about the auth service — it is handed an already-validated session.
        const definitions = modelRegistry.all();
        const name = databaseName( profileId, definitions );

        await sweepStaleDatabases( name );

        indexedFields = foreignKeyFields( definitions );
        indexedFields[SCOPE_TABLE] = new Set( ['model'] );

        const opening = new Dexie( name );
        opening.version( SCHEMA_VERSION ).stores( storeDeclaration( definitions, indexedFields ) );
        await opening.open();

        database = opening;

        writeDatabaseIndex( [name] );
        sessionChannelInstance();

        logger.debug( 'DataStore → opened', { name, tables: Object.keys( definitions ).length } );
    },

    isOpen(): boolean
    {
        return !!database;
    },

    async close(): Promise<void>
    {
        closeConnection();
    },

    async destroy(): Promise<void>
    {
        sessionChannelInstance()?.postMessage( SESSION_CLOSE_MESSAGE );

        closeConnection();
        notifySessionEnd();

        // Every recorded name, not just this profile's: login is always cold, and the
        // caller may not know which profile left a database behind.
        await sweepStaleDatabases();

        logger.debug( 'DataStore → destroyed' );
    },

    onSessionEnd( handler: () => void ): () => void
    {
        sessionChannelInstance();
        sessionEndHandlers.add( handler );
        return () => sessionEndHandlers.delete( handler );
    },

    observeById<T extends Keyed = EntityRecord>( model: string, id: string ): Stream<T | undefined>
    {
        return toStream( () => requireTable( model ).get( id ) )
            .pipe( map( record => record as unknown as T | undefined ) );
    },

    observeWhere<T extends Keyed = EntityRecord>( model: string, where?: Where ): Stream<T[]>
    {
        return toStream( () => toQuery( requireTable( model ), model, where ).toArray() )
            .pipe( map( records => records as unknown as T[] ) );
    },

    async read<T extends Keyed = EntityRecord>( model: string, ids: readonly string[] ): Promise<T[]>
    {
        if( ids.length === 0 ) return [];

        const found = await requireTable( model ).bulkGet( [...ids] );
        return found.filter( ( record ): record is EntityRecord => !!record ) as unknown as T[];
    },

    async readWhere<T extends Keyed = EntityRecord>( model: string, where?: Where ): Promise<T[]>
    {
        const found = await toQuery( requireTable( model ), model, where ).toArray();
        return found as unknown as T[];
    },

    async write( model: string, records: readonly EntityRecord[] ): Promise<void>
    {
        if( records.length === 0 ) return;

        try
        {
            await requireTable( model ).bulkPut( [...records] );
        }
        catch ( error )
        {
            // Storing fewer records than it was given is the failure mode the rest of this
            // design fails closed against, so it surfaces with the ids rather than a count.
            const failures = ( error as BulkError ).failuresByPos ?? {};
            const failedIds = Object.keys( failures ).map( position => records[Number( position )]?.id );

            logger.error( 'DataStore → write failed', { model, failedIds, error } );
            throw error;
        }
    },

    async remove( model: string, ids: readonly string[] ): Promise<void>
    {
        if( ids.length === 0 ) return;

        await requireTable( model ).bulkDelete( [...ids] );
    },

    /**
     * Removes every record for a model without affecting other models.
     *
     * @param model - Model whose records should be removed.
     */
    async clear( model: string ): Promise<void>
    {
        await requireTable( model ).clear();
    }
};
