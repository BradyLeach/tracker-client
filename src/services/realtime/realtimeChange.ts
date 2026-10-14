/**
 * Realtime Change
 *
 * Transient notification that a realtime record change was accepted locally.
 * Carries identity only, retains nothing, and leaves what the change means
 * visually to the consumer.
 */

/**
 * Realtime visual change event.
 */
export interface RealtimeChange
{
    model: string;
    recordId: string;
}

type Listener = ( change: RealtimeChange ) => void;

const listeners = new Set<Listener>();

/**
 * Publishes a realtime record change to interested UI consumers.
 *
 * @param change - Realtime record that changed.
 */
export function publishRealtimeChange( change: RealtimeChange ): void
{
    listeners.forEach( listener => listener( change ) );
}

/**
 * Subscribes to realtime record changes.
 *
 * @param listener - Callback invoked for each realtime record change.
 * @returns Unsubscribe callback.
 */
export function subscribeRealtimeChange( listener: Listener ): () => void
{
    listeners.add( listener );

    return () => listeners.delete( listener );
}
