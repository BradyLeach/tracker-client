/**
 * Projection
 *
 * Keeps a synchronous in-memory view of one or more store collections.
 *
 * The registries need render-time lookups that are synchronous and O(1) — a store read is
 * asynchronous, and a hook per lookup would mean a loading state per table cell. So they
 * hold plain Maps and refresh them when the store emits, which is a subscription lifecycle
 * with three hazards that are easy to get wrong and worth getting wrong only once:
 *
 * - A projection is not ready when it is subscribed, only when every source has emitted.
 *   Completing boot on an empty Map renders the first screen resolving ids to nothing.
 * - A superseded projection must settle its waiters. Otherwise a second connect stops the
 *   first one's subscriptions and whoever was awaiting them waits forever.
 * - A stream that errors or completes before its first emission has no answer to give, and
 *   has to say so rather than leave a waiter waiting for the life of the session.
 *
 * This is the only sanctioned way to hold a store collection outside a component.
 */

import { logger } from '@/core/utils/logger';
import { dataStore } from '@/services/dataStore/dataStore';
import type { EntityRecord, Keyed } from '@/services/dataStore/dataStore.types';

// <=======================================================================>
// <===============================> TYPES <===============================>
// <=======================================================================>

/** One collection to project, and what to do with each emission of it. */
export interface ProjectionSource
{
    model: string;
    receive( records: EntityRecord[] ): void;
}

export interface Projection
{
    /** Drops every subscription. Settles anything still waiting on the first emissions. */
    stop(): void;
}

export interface ProjectionHandle
{
    projection: Projection;

    /**
     * Resolves when every source has emitted once, or when the projection is stopped before
     * that. Rejects if a source fails or completes before its first emission — the caller is
     * bootstrap, and a store that cannot be read is a failure to boot, not an empty screen.
     */
    ready: Promise<void>;
}

// <=======================================================================>
// <==============================> SOURCES <==============================>
// <=======================================================================>

/**
 * Declares a typed source. The one cast lives here: the store's own record shape carries an
 * index signature and a domain interface does not, and every caller repeating that cast is
 * how one of them ends up casting to the wrong thing.
 *
 * @example
 * source<SystemType>( 'partnershipType', records => this.catalog.set( 'partnershipType', records ) )
 */
export function source<T extends Keyed>( model: string, receive: ( records: T[] ) => void ): ProjectionSource
{
    return { model, receive: records => receive( records as unknown as T[] ) };
}

// <=======================================================================>
// <=============================> PROJECTION <============================>
// <=======================================================================>

/**
 * Subscribes to every source and maintains a derived view over them.
 *
 * @param sources - The collections to observe, each with its own receiver.
 * @param rebuild - Called once every source has emitted, and once per emission after that.
 *        Batching the first pass matters: rebuilding per source during boot would rebuild
 *        the same derived maps once for every collection and throw all but the last away.
 *
 * @example
 * const { projection, ready } = project( sources, () => this._index() );
 * await ready;
 */
export function project( sources: readonly ProjectionSource[], rebuild: () => void ): ProjectionHandle
{
    const pending = new Set( sources.map( source => source.model ) );

    // Readiness is keyed by model, so a repeated one would mark itself arrived twice and
    // report the projection ready while another collection had emitted nothing.
    if( pending.size !== sources.length )
    {
        throw new Error( 'project: each source must name a distinct model.' );
    }

    let settle: () => void = () => undefined;
    let fail: ( error: unknown ) => void = () => undefined;
    let settled = false;

    const ready = new Promise<void>( ( resolve, reject ) =>
    {
        settle = () => { settled = true; resolve(); };
        fail = error => { settled = true; reject( error ); };
    } );

    // Emissions arriving while sources are still pending are held back from `rebuild` and
    // released by the one that empties the set.
    const arrived = ( model: string ): void =>
    {
        pending.delete( model );

        if( pending.size > 0 ) return;

        rebuild();
        if( !settled ) settle();
    };

    const subscriptions = sources.map( source => dataStore.observeWhere<EntityRecord>( source.model ).subscribe( {
        next: records =>
        {
            source.receive( records );

            if( pending.size > 0 ) arrived( source.model );
            else rebuild();
        },

        error: ( error: unknown ) =>
        {
            logger.error( 'Projection → source failed', { model: source.model, error } );

            // After the first emissions there is nothing left to settle, and a live view
            // going stale must not take down whatever else the caller went on to do.
            if( !settled ) fail( error );
        },

        // A live query is not expected to complete. One that completes before it has emitted
        // has no empty answer to give — it has no answer at all — so it is a failure rather
        // than an empty collection, and never a waiter left waiting for the session's life.
        complete: () =>
        {
            if( pending.has( source.model ) )
            {
                const error = new Error( `Projection source completed before its first emission: ${source.model}` );

                logger.error( 'Projection → source completed before emitting', { model: source.model } );
                if( !settled ) fail( error );

                return;
            }

            logger.warn( 'Projection → source completed; this view no longer updates', { model: source.model } );
        }
    } ) );

    return {
        projection: {
            stop()
            {
                subscriptions.forEach( subscription => subscription.unsubscribe() );

                // A stopped projection is superseded, not broken: whoever was awaiting it is
                // awaiting something that no longer exists, and hanging is the worse answer.
                if( !settled ) settle();
            }
        },
        ready
    };
}
