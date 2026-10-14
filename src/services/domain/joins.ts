/**
 * Join Helpers
 *
 * The store holds flat records; screens need shapes. Composition is a repeated pattern
 * rather than a varied one — join a collection to a parent by foreign key, one-to-one or
 * one-to-many, or to the ids it links through a junction model — so it gets helpers instead
 * of twenty hand-rolled combineLatest calls with subtly different re-emit and missing-parent
 * semantics.
 *
 * Every helper names its edge by association alias, never by foreign key. An alias names
 * exactly one edge; a foreign key may serve several — inventoryType's id is the key of its
 * oilProperty, soapAdditiveEffect, recipeType and materialGroup edges alike.
 *
 * This is the only sanctioned combinator surface. Domain services import these and never
 * name rxjs, which is what keeps the reactive library replaceable. A genuinely bespoke case
 * may drop to rxjs directly and should be rare enough to be conspicuous in review.
 */

import { combineLatest, defer, distinctUntilChanged, map, of, shareReplay, switchMap } from 'rxjs';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { dataStore } from '@/services/dataStore/dataStore';
import type { EntityRecord, Keyed, Stream } from '@/services/dataStore/dataStore.types';
import type { ModelAssociationDescriptor, ModelAssociationType } from '@/core/models/types';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

/** A row with one related record attached under `TAs`. */
export type WithOne<TRow, TAs extends string, TParent> = TRow & { [K in TAs]: TParent | undefined };

/** A row with its related collection attached under `TAs`. */
export type WithMany<TRow, TAs extends string, TChild> = TRow & { [K in TAs]: TChild[] };

// <=======================================================================>
// <=============================> VALIDATION <============================>
// <=======================================================================>

/** The helper that follows each association type. */
const JOIN_FOR: Record<ModelAssociationType, string> = {
    belongsTo: 'joinOne',
    hasMany: 'joinMany',
    hasOne: 'joinHasOne',
    belongsToMany: 'joinThrough',
};

/**
 * Resolves the edge a join is asking for, against the association descriptors rather than
 * trusting the string.
 *
 * Eager rather than deferred to subscribe: an alias that does not exist is a mistake in the
 * code, and it should fail at the call that made it rather than surfacing later through a
 * stream's error channel when a screen happens to render.
 *
 * @param model - Model the source rows belong to.
 * @param alias - The association alias, as the model declares it.
 * @param allowed - Association types this join can follow.
 */
function edgeFor( model: string, alias: string, allowed: ModelAssociationType[] ): ModelAssociationDescriptor
{
    if( !modelRegistry.has( model ) )
    {
        throw new Error( `joins: '${model}' is not a loaded model definition.` );
    }

    const associations = modelRegistry.associations( model );
    const edge = associations[alias];

    if( !edge )
    {
        const known = Object.keys( associations ).join( ', ' ) || 'none';
        throw new Error( `joins: '${model}' declares no association '${alias}'. Known associations: ${known}.` );
    }

    if( !allowed.includes( edge.type ) )
    {
        throw new Error( `joins: '${model}.${alias}' is a ${edge.type}. Use ${JOIN_FOR[edge.type]} instead.` );
    }

    return edge;
}

// <=======================================================================>
// <==============================> HELPERS <==============================>
// <=======================================================================>

function distinctKeys( values: ( unknown )[] ): string[]
{
    return [...new Set( values.filter( ( value ): value is string => typeof value === 'string' && value !== '' ) )];
}

/** Two key sets are the same when they hold the same members, whatever the order. */
function sameKeys( previous: string[], next: string[] ): boolean
{
    if( previous.length !== next.length ) return false;

    const held = new Set( previous );
    return next.every( key => held.has( key ) );
}

/**
 * Observes the related records for a set of keys, re-subscribing only when the set changes.
 *
 * Rows re-emit whenever any of their own fields change, and re-running the related query on
 * every one of those would tear down and rebuild a live query that is still answering the
 * same question.
 */
function observeRelated( target: string, field: string, keys: Stream<string[]> ): Stream<EntityRecord[]>
{
    return keys.pipe(
        distinctUntilChanged( sameKeys ),
        switchMap( set => set.length === 0
            ? of( [] as EntityRecord[] )
            : dataStore.observeWhere<EntityRecord>( target, { [field]: { anyOf: set } } ) )
    );
}

// <=======================================================================>
// <===============================> JOINS <===============================>
// <=======================================================================>

/**
 * Attaches the record each row points at, by a foreign key the rows themselves hold.
 *
 * The result is one observable that re-emits when either side changes — a company rename
 * updates every partnership row showing it, with nothing subscribed to companies at the
 * screen level.
 *
 * A row whose parent is not held emits with `undefined` rather than being dropped. Dropping
 * it would hide a record the caller asked for behind a missing one it did not.
 *
 * @param model - Model the source rows belong to.
 * @param rows - The rows to attach to.
 * @param alias - A `belongsTo` association of the model; its key is on the rows.
 * @param as - Property the parent is attached under.
 *
 * @example
 * joinOne( 'partnership', partnerships$, 'company', 'company' )
 * // each row gains .company
 */
export function joinOne<TRow extends Keyed, TParent extends Keyed, TAs extends string>(
    model: string,
    rows: Stream<TRow[]>,
    alias: string,
    as: TAs
): Stream<WithOne<TRow, TAs, TParent>[]>
{
    const edge = edgeFor( model, alias, ['belongsTo'] );
    const { foreignKey } = edge;

    return defer( () =>
    {
        const shared = rows.pipe( shareReplay( { bufferSize: 1, refCount: true } ) );

        const related = observeRelated(
            edge.target,
            'id',
            shared.pipe( map( current => distinctKeys( current.map( row => ( row as unknown as EntityRecord )[foreignKey] ) ) ) )
        );

        return combineLatest( [shared, related] ).pipe(
            map( ( [current, parents] ) =>
            {
                const byId = new Map( parents.map( parent => [parent.id, parent] ) );

                return current.map( row => ( {
                    ...row,
                    [as]: byId.get( ( row as unknown as EntityRecord )[foreignKey] as string )
                } ) as WithOne<TRow, TAs, TParent> );
            } )
        );
    } );
}

/**
 * Attaches the single record that points at each row, by a foreign key it holds.
 *
 * The one-to-one form of `joinMany`: a `hasOne` edge keeps the key on the other
 * side like a `hasMany` does, but holds at most one member, so the row carries
 * that member rather than a list nothing would iterate.
 *
 * A row with no related record emits `undefined`, the same as `joinOne`.
 *
 * @param model - Model the source rows belong to.
 * @param rows - The rows to attach to.
 * @param alias - A `hasOne` association of the model; its key is on the related record.
 * @param as - Property the record is attached under.
 *
 * @example
 * joinHasOne( 'inventoryType', types$, 'oilProperty', 'oilProperty' )
 * // each row gains .oilProperty
 */
export function joinHasOne<TRow extends Keyed, TRelated extends Keyed, TAs extends string>(
    model: string,
    rows: Stream<TRow[]>,
    alias: string,
    as: TAs
): Stream<WithOne<TRow, TAs, TRelated>[]>
{
    const LIST = '__joinHasOneList' as const;

    return joinMany<TRow, TRelated, typeof LIST>( model, rows, alias, LIST ).pipe(
        map( joined => joined.map( row =>
        {
            const { [LIST]: related, ...rest } = row;

            return { ...rest, [as]: related[0] } as unknown as WithOne<TRow, TAs, TRelated>;
        } ) ),
    );
}

/**
 * Attaches the records that point at each row, by a foreign key the related records hold.
 *
 * A row with no related records emits an empty array, never `undefined` — a caller mapping
 * over the collection should not have to guard the difference between "none" and "not
 * attached".
 *
 * @param model - Model the source rows belong to.
 * @param rows - The rows to attach to.
 * @param alias - A `hasMany` or `hasOne` association of the model; its key is on the
 *        related records.
 * @param as - Property the collection is attached under.
 *
 * @example
 * joinMany( 'company', companies$, 'partnership', 'partnerships' )
 * // each row gains .partnerships[]
 */
export function joinMany<TRow extends Keyed, TChild extends Keyed, TAs extends string>(
    model: string,
    rows: Stream<TRow[]>,
    alias: string,
    as: TAs
): Stream<WithMany<TRow, TAs, TChild>[]>
{
    const edge = edgeFor( model, alias, ['hasMany', 'hasOne'] );
    const { foreignKey } = edge;

    return defer( () =>
    {
        const shared = rows.pipe( shareReplay( { bufferSize: 1, refCount: true } ) );

        const related = observeRelated(
            edge.target,
            foreignKey,
            shared.pipe( map( current => distinctKeys( current.map( row => row.id ) ) ) )
        );

        return combineLatest( [shared, related] ).pipe(
            map( ( [current, children] ) =>
            {
                const byParent = new Map<string, EntityRecord[]>();

                for( const child of children )
                {
                    const parentId = child[foreignKey] as string;
                    const held = byParent.get( parentId );

                    if( held ) held.push( child );
                    else byParent.set( parentId, [child] );
                }

                return current.map( row => ( {
                    ...row,
                    [as]: byParent.get( row.id ) ?? []
                } ) as WithMany<TRow, TAs, TChild> );
            } )
        );
    } );
}

/**
 * Attaches the ids each row is linked to through a junction model, by a `belongsToMany` edge.
 *
 * The junction rows are the link: each holds the row's key and the target's. Ids rather than
 * the targets, because a many-to-many target is usually reference data the caller already
 * resolves elsewhere, and a filter only needs to know which ids a row holds.
 *
 * Re-emits when the rows or their junction rows change. A row with no links emits an empty
 * array, the same as `joinMany`.
 *
 * @param model - Model the source rows belong to.
 * @param rows - The rows to attach to.
 * @param alias - A `belongsToMany` association of the model.
 * @param as - Property the linked ids are attached under.
 *
 * @example
 * joinThrough( 'inventoryType', types$, 'recipeType', 'recipeTypeIds' )
 * // each row gains .recipeTypeIds[]
 */
export function joinThrough<TRow extends Keyed, TAs extends string>(
    model: string,
    rows: Stream<TRow[]>,
    alias: string,
    as: TAs
): Stream<WithMany<TRow, TAs, string>[]>
{
    const edge = edgeFor( model, alias, ['belongsToMany'] );
    const { via, foreignKey, otherKey } = edge;

    if( !via || !otherKey )
    {
        throw new Error( `joins: '${model}.${alias}' is a belongsToMany without a junction model and second key.` );
    }

    return defer( () =>
    {
        const shared = rows.pipe( shareReplay( { bufferSize: 1, refCount: true } ) );

        const links = observeRelated(
            via,
            foreignKey,
            shared.pipe( map( current => distinctKeys( current.map( row => row.id ) ) ) )
        );

        return combineLatest( [shared, links] ).pipe(
            map( ( [current, junctionRows] ) =>
            {
                const byRow = new Map<string, string[]>();

                for( const link of junctionRows )
                {
                    const rowId = link[foreignKey] as string;
                    const linkedId = link[otherKey] as string;
                    const held = byRow.get( rowId );

                    if( held ) held.push( linkedId );
                    else byRow.set( rowId, [linkedId] );
                }

                return current.map( row => ( {
                    ...row,
                    [as]: byRow.get( row.id ) ?? []
                } ) as WithMany<TRow, TAs, string> );
            } )
        );
    } );
}
