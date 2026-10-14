/**
 * usePartnershipStateControl
 *
 * Resolves all state graph data for a partnership and exposes
 * methods to transition to any state (free movement — no flow enforced).
 *
 * Priority when resolving a transition to a target state:
 *   1. State-specific transition from the current state
 *   2. Universal transition (no fromStateGraphStateId)
 *
 * goForward / goBack advance or retreat by sortOrder — used by the
 * Swipeable gesture once it is wired.
 */

import { stateRegistry } from '@/core/models/StateRegistry';
import { useTransitionPartnership } from './useTransitionPartnership';
import type { StateGraphState, Transition } from '@/domains/state';
import type { Partnership } from '../types/partnership.types';

export interface AvailableTransition
{
    transition: Transition;
    targetStateNode: StateGraphState;
}

export interface PartnershipStateControl
{
    orderedStates: StateGraphState[];
    availableTransitions: AvailableTransition[];
    currentIndex: number;
    isPending: boolean;
    canGoForward: boolean;
    canGoBack: boolean;
    hasTransitionTo: ( targetStateId: string ) => boolean;
    transitionTo: ( targetStateId: string ) => Promise<void>;
    goForward: () => Promise<void>;
    goBack: () => Promise<void>;
}

export function usePartnershipStateControl( partnership: Partnership ): PartnershipStateControl | null
{
    const { mutateAsync, isPending } = useTransitionPartnership();

    const { stateGraphId, currentStateGraphStateId, id: partnershipId } = partnership;

    if( !stateGraphId || !currentStateGraphStateId ) return null;

    const graph = stateRegistry.getGraph( stateGraphId );
    const orderedStates = ( graph?.stateGraphState ?? [] )
        .slice()
        .sort( ( stateA, stateB ) => stateA.sortOrder - stateB.sortOrder );

    const allTransitions = stateRegistry.getTransitions( stateGraphId );

    const resolveTransition = ( targetStateId: string ): Transition | undefined =>
    {
        const specific = allTransitions.find(
            transition => transition.toStateGraphStateId === targetStateId &&
                          transition.fromStateGraphStateId === currentStateGraphStateId
        );
        if( specific ) return specific;

        return allTransitions.find(
            transition => transition.toStateGraphStateId === targetStateId &&
                          transition.fromStateGraphStateId === undefined
        );
    };

    const hasTransitionTo = ( targetStateId: string ): boolean =>
        resolveTransition( targetStateId ) !== undefined;

    const transitionTo = async ( targetStateId: string ): Promise<void> =>
    {
        const transition = resolveTransition( targetStateId );
        if( !transition ) return;
        await mutateAsync( { partnershipId, transitionId: transition.id } );
    };

    const currentIndex = orderedStates.findIndex( state => state.id === currentStateGraphStateId );

    const goForward = async (): Promise<void> =>
    {
        const next = orderedStates[currentIndex + 1];
        if( next ) await transitionTo( next.id );
    };

    const goBack = async (): Promise<void> =>
    {
        const prev = orderedStates[currentIndex - 1];
        if( prev ) await transitionTo( prev.id );
    };

    const availableTransitions: AvailableTransition[] = orderedStates
        .filter( stateNode => stateNode.id !== currentStateGraphStateId )
        .reduce<AvailableTransition[]>( ( acc, stateNode ) =>
        {
            const transition = resolveTransition( stateNode.id );
            if( transition ) acc.push( { transition, targetStateNode: stateNode } );
            return acc;
        }, [] );

    return {
        orderedStates,
        availableTransitions,
        currentIndex,
        isPending,
        canGoForward: currentIndex < orderedStates.length - 1 && hasTransitionTo( orderedStates[currentIndex + 1]?.id ),
        canGoBack:    currentIndex > 0 && hasTransitionTo( orderedStates[currentIndex - 1]?.id ),
        hasTransitionTo,
        transitionTo,
        goForward,
        goBack,
    };
}
