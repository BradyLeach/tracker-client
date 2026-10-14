/**
 * Domain Store Factory
 *
 * The surface every domain service shares: fetch, track, shred, observe. Three values differ
 * between domains — the path, the model and the includes — and the rest is a loop that must
 * not be copied twenty times and given twenty chances to drift.
 *
 * A domain service spreads the result and adds only what is genuinely its own:
 *
 * ```ts
 * const base = createDomainStore<Company>( { path: 'business/companies', model: 'company' } );
 * export const companyService = { ...base, ownMethod() { ... } };
 * ```
 *
 * `ensureCollectionLoaded` and `ensureRecordLoaded` are the seams. Scope tracking, delete
 * handling and event reconciliation all land inside them, once, rather than in each domain.
 */

import { map, ReplaySubject } from 'rxjs';
import type { Subscription } from 'rxjs';
import { httpDataService as dataService } from '@/services/dataService/dataService';
import { clearTombstones, shred, tombstone } from '@/services/dataService/shredder';
import type { ShredOptions } from '@/services/dataService/shredder';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import { dataStore, SCOPE_TABLE } from '@/services/dataStore/dataStore';
import { createRequestTracker } from './requestState';
import type { RequestTracker } from './requestState';
import type { Stream, Where } from '@/services/dataStore/dataStore.types';
import { clearRecordScope, clearScopes, confirm, isSatisfied, markDirty } from './scope';
import type { ScopeFilter, ScopeRecord } from './scope';
import { confirmIncludeScopes } from './includeScope';
import type { DataQuerySource } from './useDataQuery';
import { processRealtimeQueue } from '@/services/realtime/realtimeQueue';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

/** The minimum a stored record must be: keyed by uuid. */
export interface DomainRecord
{
    id: string;
}

/**
 * One model's share of what a delete or restore affected, as Dawnshard reports it.
 *
 * Grouped by model rather than one entry per record, because the client's next move is a
 * removal per table and the group is that call. Dependants come first and the root model
 * last; nothing here depends on that order, but it is what the response carries.
 */
export interface AffectedRecords
{
    modelName: string;
    ids: string[];
}

/**
 * A delete or restore's full consequence set.
 *
 * `primary` — every record directly subject to the operation, including cascaded
 * records, dependants first, root model last. These are what the client removes
 * (delete) or re-reads (restore).
 *
 * `related` — records incidentally modified as a side effect, currently only
 * SET_NULL survivors. These are not deleted and must not be tombstoned — they
 * still exist, just with a cleared reference, so they are marked dirty like any
 * other update and re-fetched normally on next read.
 */
export interface DeleteRestoreResult
{
    records: {
        primary: AffectedRecords[];
        related: AffectedRecords[];
    };
}

export interface DomainStoreConfig<T extends DomainRecord>
{
    /** REST path the domain is served from, e.g. 'business/companies'. */
    path: string;

    /** Model name the shredder and the store key records by. */
    model: string;

    /** Includes requested when reading the collection. */
    collectionIncludes?: string[];

    /**
     * Includes requested when reading one record.
     *
     * Independent of the collection's, never inherited from it. A detail read usually wants
     * more than a list read, and inheriting the smaller set renders missing relations with
     * nothing to say so — the failure is a blank field, not an error.
     */
    recordIncludes?: string[];

    /**
     * Attaches the related records the screens read, applied to every observation this
     * factory returns so a domain declares its composed shape once rather than per method.
     *
     * Called at subscribe time, not at module load — the join helpers validate their edge
     * eagerly and the model definitions are not loaded until after login.
     *
     * @example
     * compose: rows => joinOne( 'partnership', rows, 'company', 'company' )
     */
    compose?: ( rows: Stream<T[]> ) => Stream<T[]>;
}

export interface DomainStore<T extends DomainRecord>
{
    /** Every record the account holds. */
    observeAll(): DataQuerySource<T[]>;

    /**
     * The records matching a clause — an edge traversal, not a view filter.
     *
     * @param where - Local query over indexed fields, evaluated by the store.
     * @param scope - The filter that would be sent to the server for this query, if it is
     *        narrower than the whole collection. Given one, the read is skipped when that
     *        scope is already satisfied — which is what makes an edge confirmed by an
     *        include serve later traversals locally.
     */
    observeWhere( where: Where, scope?: ScopeFilter ): DataQuerySource<T[]>;

    /** One record by id, or undefined while it is not held. */
    observeById( id: string ): DataQuerySource<T | undefined>;

    /** Creates a record and stores what the server returned. */
    create<TPayload>( data: TPayload ): Promise<ApiResponse<T>>;

    /** Updates a record and stores what the server returned. */
    update( id: string, data: Partial<T> ): Promise<ApiResponse<T>>;

    /**
     * Deletes a record and removes everything the server says went with it.
     *
     * A delete is rarely one row — foreign keys cascade, hooks fire, rules run — and
     * Dawnshard resolves that set rather than the client inferring it from declared edges.
     */
    remove( id: string ): Promise<ApiResponse<DeleteRestoreResult>>;

    /**
     * Hard-deletes a record and removes everything the server says went with it.
     */
    delete( id: string ): Promise<ApiResponse<DeleteRestoreResult>>;

    /**
     * Restores a soft-deleted record and everything the same removal took with it.
     *
     * The response names what came back but does not carry it, so the records are re-read
     * rather than written from the response.
     */
    restore( id: string ): Promise<ApiResponse<DeleteRestoreResult>>;

    /**
     * Runs a domain-specific write through the same store-the-response path.
     *
     * An RPC that changes a record — a state transition, say — posts somewhere other than
     * the resource, and this is how it still lands in the store without the domain repeating
     * the shred call and its options.
     */
    mutate<TResult>( request: () => Promise<ApiResponse<TResult>>, options?: ShredOptions ): Promise<ApiResponse<TResult>>;

    /**
     * Fetches the collection and shreds it, unless the store already holds it completely.
     *
     * @param filter - The query being asked for, in Dawnshard's DSL. Omitted is the whole
     *        collection, which is the broadest scope there is.
     */
    ensureCollectionLoaded( filter?: ScopeFilter ): Promise<void>;

    /** Fetches one record and shreds it. */
    ensureRecordLoaded( id: string ): Promise<void>;

    /**
     * Discards this model's persisted entities and scopes, then reloads the collection.
     *
     * @returns Promise resolved once the collection has been fetched and stored again.
     */
    refresh(): Promise<void>;
}

// <=======================================================================>
// <==============================> FACTORY <==============================>
// <=======================================================================>

export function createDomainStore<T extends DomainRecord>( config: DomainStoreConfig<T> ): DomainStore<T>
{
    const { path, model, collectionIncludes, recordIncludes, compose } = config;

    /**
     * One tracker per query surface, held for the lifetime of the module.
     *
     * Fetch state belongs to the query rather than to a component: two screens reading the
     * same collection are watching one request, and a tracker per subscription would give
     * them different answers about whether anything is in flight.
     */
    const collectionTracker = createRequestTracker();
    const recordTrackers = new Map<string, RequestTracker>();

    const trackerFor = ( id: string ): RequestTracker =>
    {
        const held = recordTrackers.get( id );
        if( held ) return held;

        const tracker = createRequestTracker();
        recordTrackers.set( id, tracker );

        return tracker;
    };

    /** Applies the domain's composed shape, if it declared one. */
    const composed = ( rows: Stream<T[]> ): Stream<T[]> => compose ? compose( rows ) : rows;

    // <===================================================================>
    // <======================> HELD COLLECTION ROWS <=====================>
    // <===================================================================>

    /**
     * The whole collection's composed rows, held open for the session and replayed to each
     * new subscriber, so a screen mounting again renders what the store already answered
     * rather than waiting on IndexedDB.
     *
     * The joins are inside it, so a change to a related record re-emits here like a change
     * to the rows themselves. One per model, never per clause or id: those are unbounded,
     * and each would hold a live query open for the rest of the session.
     */
    let collectionRows: ReplaySubject<T[]> | undefined;
    let collectionRowsSubscription: Subscription | undefined;

    /**
     * Opens the held collection stream on first read.
     *
     * Not at module load: these factories run at import time, before login has opened the
     * store, and the compose joins validate against model definitions that load after it.
     */
    const heldCollectionRows = (): Stream<T[]> =>
    {
        if( collectionRows ) return collectionRows.asObservable();

        const held = new ReplaySubject<T[]>( 1 );
        collectionRows = held;

        const subscription = composed( dataStore.observeWhere<T>( model ) ).subscribe( {
            next: rows => held.next( rows ),
            // A failed read reaches the current subscribers once and is then released, so the
            // next reader opens a fresh query rather than inheriting a finished stream.
            error: ( thrown: unknown ) =>
            {
                if( collectionRows === held )
                {
                    collectionRows = undefined;
                    collectionRowsSubscription = undefined;
                }

                held.error( thrown );
            }
        } );

        // A read that failed during subscribe has already released itself above.
        if( collectionRows === held ) collectionRowsSubscription = subscription;

        return held.asObservable();
    };

    /** Disposes the upstream live query and joins, and completes the held stream. */
    const releaseCollectionRows = (): void =>
    {
        const held = collectionRows;

        collectionRowsSubscription?.unsubscribe();
        collectionRowsSubscription = undefined;
        collectionRows = undefined;

        held?.complete();
    };

    // <===================================================================>
    // <=====================> REACTIVE SCOPE REFRESH <====================>
    // <===================================================================>

    /**
     * Ids of scopes currently being reconciled, so a liveQuery re-emission arriving
     * while a refetch is still in flight — the fetch's own eventual `confirm()` call
     * will produce one — does not start a second refetch for the same scope.
     */
    const refetchingScopes = new Set<string>();

    let scopeSubscriptionStarted = false;
    let scopeSubscription: Subscription | undefined;

    /**
     * Holds the first collection refresh so concurrent readers share the same operation.
     *
     * A store instance lives for one application load, so its first collection read
     * performs one authoritative refresh of persisted collection state.
     */
    let firstCollectionRead: Promise<void> | undefined;

    /**
     * Refetches exactly the scope that went dirty, through the same fetchScope/fetchRecord
     * path any other read uses. The resulting Dexie write is what makes an already-open
     * screen refresh — its observeWhere/observeById subscription re-emits from the write,
     * with nothing realtime-specific downstream of this.
     *
     * An `{ id }` scope is the record path's richer read; anything else — including the
     * whole-collection `{}` scope — is a collection scope.
     */
    const reconcileDirtyScope = ( scope: ScopeRecord ): void =>
    {
        if( refetchingScopes.has( scope.id ) ) return;
        refetchingScopes.add( scope.id );

        const filterKeys = Object.keys( scope.filter );
        const recordId = filterKeys.length === 1 && filterKeys[0] === 'id' ? scope.filter.id : undefined;

        const run = typeof recordId === 'string' ? fetchRecord( recordId ) : fetchScope( scope.filter );

        // A failed reconcile leaves the scope dirty, per scope.ts's own contract — the
        // next dirty transition (or another unrelated write to this table) retries it.
        void run.finally( () =>
        {
            refetchingScopes.delete( scope.id );
            void processRealtimeQueue();
        } );
    };

    /**
     * Starts the domain's one scope-table subscription, lazily on first read.
     *
     * Cannot start at module load: these factories run at import time, before login has
     * opened the store, and a liveQuery against a closed database throws at subscribe time.
     */
    const ensureScopeSubscription = (): void =>
    {
        if( scopeSubscriptionStarted ) return;
        scopeSubscriptionStarted = true;

        scopeSubscription = dataStore.observeWhere<ScopeRecord>( SCOPE_TABLE, { model } ).subscribe(
            scopes =>
            {
                scopes.forEach( scope =>
                {
                    if( scope.state === 'dirty' ) reconcileDirtyScope( scope );
                } );
            }
        );
    };

    // Registered once, at factory construction: a fresh login opens a new store, and the
    // next read re-subscribes against it rather than staying attached to the closed one.
    dataStore.onSessionEnd( () =>
    {
        scopeSubscription?.unsubscribe();
        scopeSubscription = undefined;
        scopeSubscriptionStarted = false;
        firstCollectionRead = undefined;

        // Held rows belong to the session that read them. Replaying them after the next
        // login would show one profile's records to another.
        releaseCollectionRows();
    } );

    /**
     * Fetches every page of a filter and shreds each as it lands, then confirms the scope.
     *
     * Dawnshard defaults `limit` to 100, so one request answers a filter matching four
     * hundred rows with a quarter of them. `hasMore === false` is the satisfaction
     * condition, which is what makes `includeMeta` load-bearing rather than corroborating.
     *
     * Records from pages already fetched are in the store and readable throughout. The scope
     * is simply not confirmed until the last page lands — partial is not a fourth state, and
     * the tracker is what says a fetch is still going.
     */
    const fetchScope = async ( filter: ScopeFilter ): Promise<ApiResponse<T[]>> =>
    {
        return await collectionTracker.track( async () =>
        {
            let page = 1;
            let response: ApiResponse<T[]>;

            do
            {
                response = await dataService.getAll<T>( path, {
                    ...filter,
                    includes: collectionIncludes,
                    includeMeta: true,
                    page
                } );

                if( response.error ) return response;

                await shred( response.data, model );
                await confirmEdgeScopes(
                    response.data as unknown as Record<string, unknown>[] | undefined,
                    collectionIncludes
                );

                page += 1;
            }
            while( response.meta?.hasMore );

            // Only now, with every page applied to the store. Scope validity never runs
            // ahead of the entities it describes.
            await confirm( model, filter );

            return response;
        } );
    };

    /**
     * Confirms the edge scopes a read's includes just satisfied, recursively through
     * the requested include paths.
     */
    const confirmEdgeScopes = async (
        records: Record<string, unknown>[] | undefined,
        includes: string[] | undefined
    ): Promise<void> =>
    {
        await confirmIncludeScopes( records, model, includes );
    };

    /**
     * Fetches the collection unless the store already holds it completely.
     *
     * The first read of this store instance performs an authoritative refresh.
     *
     * @param filter - The query the caller is asking for. Omitted means the whole collection.
     */
    const ensureCollectionLoaded = async ( filter: ScopeFilter = {} ): Promise<void> =>
    {
        if( !firstCollectionRead )
        {
            firstCollectionRead = refresh().catch( error =>
            {
                firstCollectionRead = undefined;
                throw error;
            } );
        }

        await firstCollectionRead;

        if( await isSatisfied( model, filter ) ) return;

        await fetchScope( filter );
    };

    /**
     * Discards this model's persisted entities and scopes, then reloads the collection.
     *
     * @returns Promise resolved once the collection has been fetched and stored again.
     */
    const refresh = async (): Promise<void> =>
    {
        // Tracked from the clear, so the emptied table reads as loading rather than as an empty collection.
        let clearFailure: unknown;

        await collectionTracker.track( async () =>
        {
            try
            {
                await dataStore.clear( model );
                await clearScopes( model );
            }
            catch ( error )
            {
                clearFailure = error;
                throw error;
            }

            return fetchScope( {} );
        } );

        // A failed clear still rejects, so the next first read retries it.
        if( clearFailure ) throw clearFailure;
    };

    /** Fetches one record and shreds it, whatever scope says. */
    const fetchRecord = async ( id: string ): Promise<void> =>
    {
        await trackerFor( id ).track( async () =>
        {
            const response = await dataService.getOne<T>( path, id, { includes: recordIncludes } );

            if( response.error ) return response;

            await shred( response.data, model );
            await confirmEdgeScopes(
                response.data ? [response.data as unknown as Record<string, unknown>] : [],
                recordIncludes
            );
            await confirm( model, { id } );

            return response;
        } );
    };

    const ensureRecordLoaded = async ( id: string ): Promise<void> =>
    {
        // A record is covered by a satisfied scope only if the read that satisfied it asked
        // for at least the relations a detail read needs. A list read with fewer includes
        // leaves the record present but thinner, and serving that as complete renders the
        // missing relations as blanks with nothing to say why.
        const listCarriesEnough = ( recordIncludes ?? [] )
            .every( include => ( collectionIncludes ?? [] ).includes( include ) );

        if( listCarriesEnough && await isSatisfied( model, { id } ) ) return;

        await fetchRecord( id );
    };

    const mutate = async <TResult>(
        request: () => Promise<ApiResponse<TResult>>,
        options: ShredOptions = {}
    ): Promise<ApiResponse<TResult>> =>
    {
        const response = await request();

        // A mutation is the actor's own write applying to their own screen, so a failed
        // store write reaches the caller rather than leaving a save that did nothing.
        if( !response.error ) await shred( response.data, model, { mutation: true, ...options } );

        return response;
    };

    async function applyDeleteLifecycle(
        response: ApiResponse<DeleteRestoreResult>
    ): Promise<ApiResponse<DeleteRestoreResult>>
    {
        if( response.error ) return response;

        const primary = response.data?.records.primary ?? [];
        const related = response.data?.records.related ?? [];

        // Every id in the primary set, before a single row is removed. A response
        // generated before the delete can still be in flight, and it would otherwise
        // write the cascaded children back with nothing left to correct them.
        tombstone( primary.flatMap( group => group.ids ) );

        for( const group of primary )
        {
            await dataStore.remove( group.modelName, group.ids );

            for( const removedId of group.ids )
            {
                await clearRecordScope( group.modelName, removedId );
            }
        }

        // Related records (SET_NULL survivors) are not deleted — they still exist with
        // a cleared reference, so they are dirtied like any other update, never
        // tombstoned or removed.
        for( const group of related )
        {
            await markDirty( group.modelName );
        }

        return response;
    }

    return {
        observeAll()
        {
            void ensureCollectionLoaded();
            ensureScopeSubscription();

            return {
                data: heldCollectionRows(),
                request: collectionTracker.state,
                refetch: () => { void fetchScope( {} ); },
                refresh: () => { void refresh(); }
            };
        },

        observeWhere( where: Where, scope: ScopeFilter = {} )
        {
            void ensureCollectionLoaded( scope );
            ensureScopeSubscription();

            return {
                data: composed( dataStore.observeWhere<T>( model, where ) ),
                request: collectionTracker.state,
                // Refetch is an explicit ask, so it goes to the network whatever scope says.
                refetch: () => { void fetchScope( scope ); }
            };
        },

        observeById( id: string )
        {
            void ensureRecordLoaded( id );
            ensureScopeSubscription();

            // Read as a collection of one so the record carries the same composed shape a
            // table row does, then narrowed here — a detail screen and a row read a missing
            // relation identically, and no domain repeats the narrowing.
            return {
                data: composed( dataStore.observeWhere<T>( model, { id } ) ).pipe( map( rows => rows[0] ) ),
                request: trackerFor( id ).state,
                refetch: () => { void fetchRecord( id ); }
            };
        },

        create<TPayload>( data: TPayload )
        {
            // A create returning a tombstoned id clears it in the same operation, which is
            // what makes restore after a soft delete a real path.
            return mutate<T>( () => dataService.create<T>( path, data ), { restores: true } );
        },

        update( id: string, data: Partial<T> )
        {
            return mutate<T>( () => dataService.update<T>( path, id, data ) );
        },

        async remove( id: string )
        {
            return applyDeleteLifecycle( await dataService.remove<DeleteRestoreResult>( path, id ) );
        },

        async delete( id: string )
        {
            return applyDeleteLifecycle(
                await dataService.delete<DeleteRestoreResult>( `${path}/${id}`, undefined, { hard: true } )
            );
        },

        async restore( id: string )
        {
            const response = await dataService.post<DeleteRestoreResult>( `${path}/${id}/restore` );

            if( response.error ) return response;

            const primary = response.data?.records.primary ?? [];
            const related = response.data?.records.related ?? [];

            // Everything the restore brought back is no longer deleted, so the whole
            // primary set clears — not only the root, as a create or update response would.
            clearTombstones( primary.flatMap( group => group.ids ) );

            // The response names what came back but does not carry it, so the rows are
            // re-read rather than written from it. The root is fetched now, because that is
            // what the actor is looking at.
            await fetchRecord( id );

            // Whatever the root's includes did not bring back is marked for the next read
            // rather than fetched here. A cascade is unbounded and this is not the paged
            // path; the collection reads are, and a dirty scope sends them to the network.
            for( const group of primary )
            {
                if( group.modelName === model ) continue;

                await markDirty( group.modelName );
            }

            // Related records were never removed by the delete this restore reverses, so
            // there is nothing to un-tombstone — only to mark dirty, same as remove()'s side.
            for( const group of related )
            {
                await markDirty( group.modelName );
            }

            return response;
        },

        mutate,
        ensureCollectionLoaded,
        ensureRecordLoaded,
        refresh
    };
}
