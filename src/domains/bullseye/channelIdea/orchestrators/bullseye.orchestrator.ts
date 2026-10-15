/**
 * bullseye.orchestrator
 *
 * The Bullseye board's arrangement: ideas grouped by ring, the order the rings are read
 * in, and where an idea can move from each ring. Pure functions over the ideas, so the
 * board and a playground arrange them the same way.
 *
 * Rings read outward-in, as the method runs: brainstorm in the outer ring, test the
 * promising ideas cheaply in the middle, focus on what works in the inner.
 */

import type { BullseyeRing, ChannelIdea } from '../types/channelIdea.types';

export const RING_ORDER: readonly BullseyeRing[] = ['outer', 'middle', 'inner'];

/** Each ring's ideas, most recently changed first. Every ring is present, empty or not. */
export function groupIdeasByRing( ideas: readonly ChannelIdea[] ): Record<BullseyeRing, ChannelIdea[]>
{
    const grouped: Record<BullseyeRing, ChannelIdea[]> = { outer: [], middle: [], inner: [] };

    for( const idea of ideas ) grouped[idea.ring]?.push( idea );

    for( const ring of RING_ORDER )
    {
        grouped[ring].sort( ( first, second ) => ( second.updatedAt ?? '' ).localeCompare( first.updatedAt ?? '' ) );
    }

    return grouped;
}

/** The rings an idea can move to from where it is: one step in or one step out. */
export function adjacentRings( ring: BullseyeRing ): BullseyeRing[]
{
    const index = RING_ORDER.indexOf( ring );
    return [RING_ORDER[index - 1], RING_ORDER[index + 1]].filter( ( next ): next is BullseyeRing => next !== undefined );
}

/** How many ideas each channel holds, for the channel library. */
export function countIdeasByChannel( ideas: readonly ChannelIdea[] ): Map<string, number>
{
    const counts = new Map<string, number>();
    for( const idea of ideas ) counts.set( idea.channelId, ( counts.get( idea.channelId ) ?? 0 ) + 1 );
    return counts;
}
