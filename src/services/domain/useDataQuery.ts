/**
 * Hook Adapter
 *
 * Subscribes a component to a Stream and preserves the request-state contract the existing
 * call sites are written against. The store gives data reactivity, not request state, so
 * this adapter supplies it.
 *
 * Data comes from the store; whether a fetch is in flight comes from the Domain Service,
 * because that is what decides between a satisfied local read and a REST call. The two are
 * joined here rather than in either of them.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { logger } from '@/core/utils/logger';
import type { ApiError } from '@/services/dataService/dataService.types';
import type { Stream } from '@/services/dataStore/dataStore.types';
import type { RequestState } from './requestState';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

/**
 * What a Domain Service hands the hook: the live answer, and how the fetch behind it is going.
 */
export interface DataQuerySource<T>
{
    /** The store's answer, re-emitting on every change. */
    data: Stream<T>;

    /** The Domain Service's fetch state for this query. */
    request: Stream<RequestState>;

    /** Runs the fetch again. Omit for a query that only ever reads locally. */
    refetch?: () => void;

    /**
     * Discards what is held locally and loads it again. Omit for a query with no
     * authoritative reset of its own.
     */
    refresh?: () => void;
}

/**
 * The read contract. Deliberately the shape the existing hooks already return, so consumers
 * destructure the same names before and after a domain migrates.
 */
export interface DataQueryResult<T>
{
    data: T | undefined;

    /**
     * There is nothing to render yet, and something is still going to arrive.
     *
     * Two states qualify, and they are different questions:
     *
     * - The store has not answered. `undefined` means no answer yet; `[]` is an answer. A
     *   satisfied scope runs no fetch, so without this the millisecond before the read
     *   resolves renders an empty state on a screen whose data is already held locally.
     * - The store answered with nothing and a fetch is in flight, which is the cold miss.
     *
     * A genuinely empty collection with no fetch pending is neither: it is an answer, and
     * the empty state is the right thing to show.
     */
    isLoading: boolean;

    /** A request is active, whether or not rows are already on screen. */
    isFetching: boolean;

    isError: boolean;
    error: ApiError | undefined;
    refetch: () => void;

    /** Discards what is held locally and loads it again. A no-op when the source has none. */
    refresh: () => void;
}

const SETTLED: RequestState = { isFetching: false };

// <=======================================================================>
// <=============================> HELPERS <===============================>
// <=======================================================================>

/**
 * Whether the store's answer counts as data on screen.
 *
 * An empty array is an answer, but it is not something to render rows from — which is the
 * difference between a cold miss and a genuinely empty collection.
 */
function hasData( value: unknown ): boolean
{
    if( value === undefined || value === null ) return false;
    if( Array.isArray( value ) ) return value.length > 0;

    return true;
}

// <=======================================================================>
// <==============================> READS <================================>
// <=======================================================================>

/**
 * Subscribes to a query source for the lifetime of the component.
 *
 * @param source - Builds the source. Returning undefined disables the query, which is how a
 *        read waiting on an id it does not have yet stays idle rather than fetching null.
 * @param deps - Rebuilds and resubscribes when these change, as with any React dependency list.
 *
 * @example
 * const { data, isLoading } = useDataQuery( () => companyService.observeAll(), [] );
 */
export function useDataQuery<T>( source: () => DataQuerySource<T> | undefined, deps: DependencyList ): DataQueryResult<T>
{
    const [data, setData] = useState<T | undefined>( undefined );
    const [request, setRequest] = useState<RequestState>( SETTLED );

    /**
     * Whether there is a query at all.
     *
     * A disabled source is idle, not pending — it is waiting on an id the caller does not
     * have yet, and nothing is coming until it does. Without this, "the store has not
     * answered" would read as loading forever on a query that was never asked.
     */
    const [enabled, setEnabled] = useState( true );

    /**
     * A failure of the store read itself, as opposed to the fetch behind it.
     *
     * The two are different failures and the tracker only knows about one: it reports on
     * requests, and a store that cannot be read has no request to report. Without this a
     * broken subscription ends silently — the stream errors, no observer re-emits, and the
     * screen renders empty as though the collection were genuinely empty.
     */
    const [streamError, setStreamError] = useState<ApiError | undefined>( undefined );

    // Held so refetch stays stable across renders rather than changing identity every time.
    const sourceRef = useRef<DataQuerySource<T> | undefined>( undefined );

    // Before paint, so a source that replays what the store already answered renders its
    // rows on the first frame rather than a skeleton for one.
    useLayoutEffect( () =>
    {
        const active = source();
        sourceRef.current = active;
        setStreamError( undefined );
        setEnabled( !!active );

        // Rows belong to the query that emitted them. A new query starts unanswered, so the
        // previous one's rows are never shown under the new identity.
        setData( undefined );

        if( !active )
        {
            setRequest( SETTLED );
            return;
        }

        const subscriptions = [
            // No clearing on `next`: a stream that errors is finished, so the only recovery
            // is a new subscription, and that clears the error where it is built above.
            active.data.subscribe( {
                next: setData,
                error: ( thrown: unknown ) =>
                {
                    logger.error( 'Store read failed', { error: thrown } );

                    setStreamError( {
                        key: 'transport.error',
                        details: { message: thrown instanceof Error ? thrown.message : String( thrown ) }
                    } );
                }
            } ),
            active.request.subscribe( { next: setRequest } )
        ];

        return () =>
        {
            subscriptions.forEach( subscription => subscription.unsubscribe() );
            sourceRef.current = undefined;
        };
        // The caller declares what the source depends on; source itself is rebuilt each render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps );

    const refetch = useCallback( () => sourceRef.current?.refetch?.(), [] );
    const refresh = useCallback( () => sourceRef.current?.refresh?.(), [] );

    // A store read that failed is reported ahead of the fetch's own error: the fetch may
    // well have succeeded, and its response then had nowhere to land. Reporting the request
    // as fine while the screen shows nothing is the state this exists to prevent.
    const error = streamError ?? request.error;

    // `undefined` is the store not having answered; `[]` is it answering with nothing. Only
    // the first is unconditionally loading — a failed read has answered, in its own way, and
    // must fall through to the error state rather than spinning forever.
    const answered = data !== undefined || !!streamError;

    return {
        data,
        isLoading: enabled && ( !answered || ( !hasData( data ) && request.isFetching ) ),
        isFetching: request.isFetching,
        isError: !!error,
        error,
        refetch,
        refresh
    };
}

// <=======================================================================>
// <==============================> WRITES <===============================>
// <=======================================================================>

/**
 * The write contract, separate from the read: a mutation's progress says nothing about
 * whether the collection it writes into is loaded.
 */
export interface DataMutationResult<TData, TVariables>
{
    mutate: ( variables: TVariables ) => void;
    mutateAsync: ( variables: TVariables ) => Promise<TData>;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: ApiError | undefined;
    data: TData | undefined;
    reset: () => void;
}

export interface DataMutationOptions<TData, TVariables>
{
    /** Called with the returned record after a successful mutation. */
    onSuccess?: ( data: TData, variables: TVariables ) => void;

    /** Called with the ApiError after a failed mutation. */
    onError?: ( error: ApiError, variables: TVariables ) => void;
}

/**
 * Runs a mutation and reports its progress.
 *
 * There is no cache to invalidate. The response is shredded into the store by the Domain
 * Service, and every observer of the affected records re-emits on its own — which is the
 * whole reason invalidation disappears from this layer.
 *
 * @param mutate - Performs the write and returns the record the server stored.
 */
export function useDataMutation<TData, TVariables>(
    mutate: ( variables: TVariables ) => Promise<TData>,
    options?: DataMutationOptions<TData, TVariables>
): DataMutationResult<TData, TVariables>
{
    const [isPending, setIsPending] = useState( false );
    const [error, setError] = useState<ApiError | undefined>( undefined );
    const [data, setData] = useState<TData | undefined>( undefined );
    const [isSuccess, setIsSuccess] = useState( false );

    // A mutation that resolves after unmount must not set state on a dead component.
    const mounted = useRef( true );
    useEffect( () =>
    {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, [] );

    const mutateAsync = useCallback( async ( variables: TVariables ): Promise<TData> =>
    {
        setIsPending( true );
        setError( undefined );
        setIsSuccess( false );

        try
        {
            const result = await mutate( variables );

            if( mounted.current )
            {
                setData( result );
                setIsSuccess( true );
                setIsPending( false );
            }

            options?.onSuccess?.( result, variables );
            return result;
        }
        catch ( thrown )
        {
            const apiError: ApiError = isApiError( thrown )
                ? thrown
                : { key: 'transport.error', details: { message: thrown instanceof Error ? thrown.message : String( thrown ) } };

            if( mounted.current )
            {
                setError( apiError );
                setIsPending( false );
            }

            options?.onError?.( apiError, variables );
            throw thrown;
        }
        // Options are read at call time, so they do not need to re-create this callback.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mutate] );

    const mutateFn = useCallback( ( variables: TVariables ) =>
    {
        void mutateAsync( variables ).catch( () => undefined );
    }, [mutateAsync] );

    const reset = useCallback( () =>
    {
        setIsPending( false );
        setError( undefined );
        setData( undefined );
        setIsSuccess( false );
    }, [] );

    return { mutate: mutateFn, mutateAsync, isPending, isError: !!error, isSuccess, error, data, reset };
}

function isApiError( value: unknown ): value is ApiError
{
    return typeof value === 'object' && value !== null && typeof ( value as ApiError ).key === 'string';
}
