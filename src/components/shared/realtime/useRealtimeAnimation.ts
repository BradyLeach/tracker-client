/**
 * useRealtimeAnimation
 *
 * Reliably restarts the realtime trace when a record changes. The effect itself
 * is entirely CSS (`.realtime-trace` in index.css); this only decides when to
 * run it again.
 *
 * The returned class goes straight onto the element that owns the visual
 * boundary — a Card, a TableContainer, a row — so no wrapper element exists to
 * change that element's layout or sizing.
 *
 * @example
 * ```tsx
 * const traceClass = useRealtimeAnimation( realtimeTrigger );
 *
 * <Card className={traceClass}>…</Card>
 * ```
 */

import { useEffect, useRef, useState } from 'react';

const TRACE_CLASS = 'realtime-trace';

/**
 * Runs the realtime trace each time the trigger changes.
 *
 * @param trigger - Changing this from one defined value to another runs the trace
 *        once. `undefined` means no trigger, and mounting never runs it.
 * @returns The trace class while a run is active, otherwise an empty string.
 */
export function useRealtimeAnimation( trigger?: number | string ): string
{
    const [running, setRunning] = useState( false );
    const previousTrigger = useRef( trigger );
    const frame = useRef<number>( 0 );

    useEffect( () => () => cancelAnimationFrame( frame.current ), [] );

    useEffect( () =>
    {
        const previous = previousTrigger.current;
        previousTrigger.current = trigger;

        // Seeded with the incoming value, so mount compares equal and is a no-op.
        // An undefined on either side is an absence of a trigger, not a change.
        if( previous === undefined || trigger === undefined ) return;
        if( previous === trigger ) return;

        // Re-applying a class the element already carries restarts nothing, so the
        // class is dropped and put back. Two frames, not one: a single frame can be
        // batched into the same paint as the re-add, and the browser then never sees
        // the element without the class — which is the restart failing silently.
        cancelAnimationFrame( frame.current );
        setRunning( false );

        frame.current = requestAnimationFrame( () =>
        {
            frame.current = requestAnimationFrame( () => setRunning( true ) );
        } );
    }, [trigger] );

    return running ? TRACE_CLASS : '';
}
