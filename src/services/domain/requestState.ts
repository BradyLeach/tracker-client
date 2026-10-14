/**
 * Request State
 *
 * Whether a fetch is in flight, and what it failed with. This is orchestration state, not
 * entity data — it is never persisted, because it describes a request rather than a record.
 *
 * The Domain Service owns it, because the Domain Service is what decides whether a read is
 * satisfied locally or has to go to REST. The store cannot answer that: it only reports what
 * is held. A tracker is created per query surface and handed to the hook alongside the
 * store's stream.
 *
 * Domain services get this without naming rxjs — that is the point of the tracker existing
 * rather than every service hand-rolling a subject.
 */

import { BehaviorSubject } from 'rxjs';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { ApiError } from '@/services/dataService/dataService.types';
import type { Stream } from '@/services/dataStore/dataStore.types';

export interface RequestState
{
    /** A network request is active. */
    isFetching: boolean;

    /** The last failure. Kept until the next successful fetch, so data is never cleared with it. */
    error?: ApiError;
}

const SETTLED: RequestState = { isFetching: false };

export interface RequestTracker
{
    /** Emits on every change, and immediately on subscribe. */
    state: Stream<RequestState>;

    /** The state right now, for a caller that is not subscribing. */
    current(): RequestState;

    /**
     * Runs a fetch, reporting it.
     *
     * Never throws. A transport failure is recorded and returned as an error response, the
     * same contract the http layer already follows — it does not reject on 4xx/5xx either.
     * A tracker that rethrew would report the failure twice: once into state, and once as a
     * rejection every fire-and-forget refetch would have to remember to catch.
     */
    track<T>( fetch: () => Promise<ApiResponse<T>> ): Promise<ApiResponse<T>>;

    /** Clears the recorded error without touching whether a fetch is in flight. */
    clearError(): void;
}

/**
 * Creates a tracker for one query surface.
 *
 * Concurrent fetches are counted rather than flagged: two overlapping requests must not
 * have the first to finish report the second as settled.
 */
export function createRequestTracker(): RequestTracker
{
    const subject = new BehaviorSubject<RequestState>( SETTLED );
    let inFlight = 0;

    const publish = ( error: ApiError | undefined ) =>
    {
        subject.next( error ? { isFetching: inFlight > 0, error } : { isFetching: inFlight > 0 } );
    };

    return {
        state: subject.asObservable(),

        current: () => subject.getValue(),

        async track<T>( fetch: () => Promise<ApiResponse<T>> ): Promise<ApiResponse<T>>
        {
            inFlight += 1;
            publish( subject.getValue().error );

            try
            {
                const response = await fetch();

                inFlight -= 1;

                // A response carrying an error is a failed fetch, even though it resolved:
                // the transport succeeded and the API said no.
                publish( response.error );

                return response;
            }
            catch ( error )
            {
                const apiError = {
                    key: 'transport.error',
                    details: { message: error instanceof Error ? error.message : String( error ) }
                };

                inFlight -= 1;
                publish( apiError );

                return { error: apiError };
            }
        },

        clearError()
        {
            publish( undefined );
        }
    };
}
