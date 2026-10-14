/**
 * useRealtimeChanges
 *
 * Subscribes to realtime change events for one model and maintains a
 * nonce map keyed by record id. Each time a record changes, its nonce
 * increments. Records that have never changed are absent from the map.
 */

import { useEffect, useState } from 'react';
import { subscribeRealtimeChange } from '@/services/realtime/realtimeChange';

export function useRealtimeChanges( model: string ): Record<string, number>
{
    const [changes, setChanges] = useState<Record<string, number>>( {} );

    useEffect( () => subscribeRealtimeChange( change =>
    {
        if( change.model !== model ) return;

        setChanges( previous => ( {
            ...previous,
            [change.recordId]: ( previous[change.recordId] ?? 0 ) + 1,
        } ) );
    } ), [model] );

    return changes;
}
