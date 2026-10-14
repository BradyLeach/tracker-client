/**
 * Scope
 *
 * Entities answer what the store holds. Scope answers whether what it holds is complete for
 * the query being asked — a normalised store can hold three companies for a filter while the
 * server has seven, and nothing about the entities tells them apart.
 *
 * Scope is recorded, never inferred from the data, and persisted alongside the entities it
 * describes so a refresh does not have to relearn it.
 *
 * It is not the request tracker. Scope decides *whether* a fetch is needed; the tracker
 * (requestState.ts) reports *that* one is in flight. Inferring either from the other would
 * couple a completeness question to a transport one.
 */

import { dataStore, SCOPE_TABLE } from '@/services/dataStore/dataStore';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

/**
 * A scope filter is the query that went to Dawnshard, in Dawnshard's DSL.
 *
 * This is not the DataStore port's `Where`. That one is a local query over indexed fields,
 * evaluated by the storage engine. This one is never evaluated by the store at all — the
 * subset test only ever compares scope filters to each other.
 */
export type ScopeValue = string | number | boolean;

export interface ScopeAnyOf { anyOf: readonly ScopeValue[] }

export interface ScopeRange
{
    moreThan?: ScopeValue;
    moreThanOrEqual?: ScopeValue;
    lessThan?: ScopeValue;
    lessThanOrEqual?: ScopeValue;
}

/**
 * Dawnshard's field operators are wider than this. Anything outside the comparable set is
 * still a legal filter — it simply cannot be compared, and falls through to a fetch.
 */
export type ScopeCondition = ScopeValue | ScopeAnyOf | ScopeRange | Record<string, unknown>;

export type ScopeFilter = Record<string, ScopeCondition>;

/**
 * `dirty` means "this was complete, an event says it may not be, and we have not reconciled
 * yet". It reads as unsatisfied, so a failure degrades into an extra fetch rather than a
 * false claim of completeness.
 */
export type ScopeState = 'satisfied' | 'dirty';
export type MarkDirtyResult = 'marked' | 'already-dirty' | 'not-held';

export interface ScopeRecord
{
    /** The canonical filter key. Equivalent filters resolve to one record. */
    id: string;
    model: string;
    filter: ScopeFilter;
    state: ScopeState;
    confirmedAt?: string;
    [field: string]: unknown;
}

// <=======================================================================>
// <===========================> CANONICAL KEYS <==========================>
// <=======================================================================>

/**
 * Normalises a value so equivalent filters produce identical keys.
 *
 * `anyOf` is a set, so its order carries no meaning and must not carry a key difference.
 */
function canonicalValue( value: unknown ): unknown
{
    if( Array.isArray( value ) )
    {
        return [...value].map( canonicalValue ).sort( ( left, right ) => String( left ).localeCompare( String( right ) ) );
    }

    if( value && typeof value === 'object' )
    {
        return canonicalFilter( value as Record<string, unknown> );
    }

    return value;
}

/** Sorts keys at every level, so `{ a, b }` and `{ b, a }` are one filter. */
function canonicalFilter( filter: Record<string, unknown> ): Record<string, unknown>
{
    return Object.fromEntries(
        Object.keys( filter ).sort().map( key => [key, canonicalValue( filter[key] )] )
    );
}

/**
 * The key a scope is stored under.
 *
 * Equivalent filters must resolve to one record, or the same query asked twice creates two
 * and neither is ever satisfied.
 */
export function scopeKey( model: string, filter: ScopeFilter ): string
{
    return `${model}|${JSON.stringify( canonicalFilter( filter ) )}`;
}

// <=======================================================================>
// <============================> THE SUBSET TEST <========================>
// <=======================================================================>

function isAnyOf( condition: unknown ): condition is ScopeAnyOf
{
    return !!condition && typeof condition === 'object' && Array.isArray( ( condition as ScopeAnyOf ).anyOf );
}

const RANGE_KEYS = ['moreThan', 'moreThanOrEqual', 'lessThan', 'lessThanOrEqual'];

function isRange( condition: unknown ): condition is ScopeRange
{
    if( !condition || typeof condition !== 'object' || Array.isArray( condition ) ) return false;

    const keys = Object.keys( condition );
    return keys.length > 0 && keys.every( key => RANGE_KEYS.includes( key ) );
}

function isScalar( condition: unknown ): condition is ScopeValue
{
    return typeof condition === 'string' || typeof condition === 'number' || typeof condition === 'boolean';
}

/** The lower bound a range admits, and whether the bound itself is included. */
function lowerBound( range: ScopeRange ): { at: ScopeValue | undefined; inclusive: boolean }
{
    if( range.moreThanOrEqual !== undefined ) return { at: range.moreThanOrEqual, inclusive: true };
    return { at: range.moreThan, inclusive: false };
}

function upperBound( range: ScopeRange ): { at: ScopeValue | undefined; inclusive: boolean }
{
    if( range.lessThanOrEqual !== undefined ) return { at: range.lessThanOrEqual, inclusive: true };
    return { at: range.lessThan, inclusive: false };
}

function withinRange( value: ScopeValue, range: ScopeRange ): boolean
{
    const lower = lowerBound( range );
    const upper = upperBound( range );

    if( lower.at !== undefined && ( lower.inclusive ? value < lower.at : value <= lower.at ) ) return false;
    if( upper.at !== undefined && ( upper.inclusive ? value > upper.at : value >= upper.at ) ) return false;

    return true;
}

/** True when every value the requested range admits is admitted by the held range too. */
function rangeWithinRange( requested: ScopeRange, held: ScopeRange ): boolean
{
    const requestedLower = lowerBound( requested );
    const heldLower = lowerBound( held );
    const requestedUpper = upperBound( requested );
    const heldUpper = upperBound( held );

    if( heldLower.at !== undefined )
    {
        if( requestedLower.at === undefined ) return false;
        if( requestedLower.at < heldLower.at ) return false;
        if( requestedLower.at === heldLower.at && heldLower.inclusive === false && requestedLower.inclusive ) return false;
    }

    if( heldUpper.at !== undefined )
    {
        if( requestedUpper.at === undefined ) return false;
        if( requestedUpper.at > heldUpper.at ) return false;
        if( requestedUpper.at === heldUpper.at && heldUpper.inclusive === false && requestedUpper.inclusive ) return false;
    }

    return true;
}

/**
 * True when everything the requested condition admits, the held condition admits too.
 *
 * The comparable set is equality, `anyOf` and ranges — what real filters are. Anything else
 * returns false and falls through to a fetch: failing toward a network call is always safe,
 * failing toward "assume we hold it" is the silent-wrong-data case this exists to prevent.
 */
function conditionWithin( requested: ScopeCondition, held: ScopeCondition ): boolean
{
    if( isScalar( held ) ) return isScalar( requested ) && requested === held;

    if( isAnyOf( held ) )
    {
        if( isScalar( requested ) ) return held.anyOf.includes( requested );
        if( isAnyOf( requested ) ) return requested.anyOf.every( value => held.anyOf.includes( value ) );

        return false;
    }

    if( isRange( held ) )
    {
        if( isScalar( requested ) ) return withinRange( requested, held );
        if( isRange( requested ) ) return rangeWithinRange( requested, held );

        return false;
    }

    return false;
}

/**
 * True when the requested filter selects a subset of what the held filter selects.
 *
 * Fewer constraints means broader, so every constraint the held filter carries must be met
 * at least as tightly by the requested one. Extra constraints on the requested side only
 * narrow it further, which is still a subset.
 */
export function isWithin( requested: ScopeFilter, held: ScopeFilter ): boolean
{
    return Object.entries( held ).every( ( [field, condition] ) =>
    {
        const asked = requested[field];
        return asked !== undefined && conditionWithin( asked, condition );
    } );
}

// <=======================================================================>
// <=============================> THE RECORD <============================>
// <=======================================================================>

/**
 * Whether the store holds everything this filter asks for.
 *
 * A dirty scope reads as unsatisfied — it was complete, an event says it may not be, and
 * nothing has reconciled it yet.
 */
export async function isSatisfied( model: string, filter: ScopeFilter ): Promise<boolean>
{
    const held = await dataStore.readWhere<ScopeRecord>( SCOPE_TABLE, { model } );

    return held.some( scope => scope.state === 'satisfied' && isWithin( filter, scope.filter ) );
}

/**
 * Records that the store now holds everything this filter asks for.
 *
 * Called by the Domain Service after the shred completes, never by the shredder: scope
 * validity must never run ahead of the entities, and the shredder has no request context.
 */
export async function confirm( model: string, filter: ScopeFilter ): Promise<void>
{
    await dataStore.write( SCOPE_TABLE, [{
        id: scopeKey( model, filter ),
        model,
        filter,
        state: 'satisfied',
        confirmedAt: new Date().toISOString()
    }] );
}

/**
 * Marks matching held scopes as dirty.
 *
 * Realtime generation state is managed by the realtime queue. Scope state
 * represents only whether a held dataset is currently satisfied or requires
 * reconciliation.
 *
 * @param model - Model whose held scopes should be invalidated.
 * @param filter - Optional filter limiting which held scopes are affected.
 * @returns Result describing whether the invalidation was recorded or deferred.
 */
export async function markDirty( model: string, filter?: ScopeFilter ): Promise<MarkDirtyResult>
{
    const held = await dataStore.readWhere<ScopeRecord>( SCOPE_TABLE, { model } );

    const matching = held.filter( scope =>
        !filter || isWithin( filter, scope.filter ) );

    if( matching.length === 0 ) return 'not-held';

    if( matching.some( scope => scope.state === 'dirty' ) ) return 'already-dirty';

    await dataStore.write(
        SCOPE_TABLE,
        matching.map( scope => ( { ...scope, state: 'dirty' } ) )
    );

    return 'marked';
}

/** Every scope held for a collection. For diagnostics and for showing a boundary to the user. */
export function scopesFor( model: string ): Promise<ScopeRecord[]>
{
    return dataStore.readWhere<ScopeRecord>( SCOPE_TABLE, { model } );
}

/**
 * Removes the scope record held for one record, leaving every other scope intact.
 *
 * A record that no longer exists cannot be fetched, so a scope still claiming a read is
 * owed for it would stay dirty with nothing able to confirm it.
 *
 * @param model - Model the record belongs to.
 * @param id - Record whose scope should be removed.
 * @returns Promise resolved once the scope record is removed.
 */
export async function clearRecordScope( model: string, id: string ): Promise<void>
{
    await dataStore.remove( SCOPE_TABLE, [scopeKey( model, { id } )] );
}

/**
 * Removes every scope record held for a model without affecting other models.
 *
 * @param model - Model whose scope records should be removed.
 * @returns Promise resolved once the scope records are removed.
 */
export async function clearScopes( model: string ): Promise<void>
{
    const held = await scopesFor( model );

    if( held.length === 0 ) return;

    await dataStore.remove( SCOPE_TABLE, held.map( scope => scope.id ) );
}

/**
 * Marks every held scope, across every model, as needing reconciliation.
 *
 * The full-refresh fallback for stale realtime recovery: which held scopes a missed
 * event broke cannot be known, so all of them are treated as broken and the normal
 * data layer rebuilds authoritative state from REST as each is next read.
 */
export async function markAllDirty(): Promise<void>
{
    const held = await dataStore.readWhere<ScopeRecord>( SCOPE_TABLE );
    const affected = held.filter( scope => scope.state === 'satisfied' );

    if( affected.length === 0 ) return;

    await dataStore.write( SCOPE_TABLE, affected.map( scope => ( { ...scope, state: 'dirty' } ) ) );
}
