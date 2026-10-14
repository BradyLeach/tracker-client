import type { State } from '../../stateGraph/types/stateGraph.types';

export interface TransitionEvent
{
    id: string;
    ownerId: string;
    entityType: string;
    entityId: string;
    transitionId: string;
    fromStateId: string;
    toStateId: string;
    triggeredBy: string;
    occurredAt: string;
    fromState?: State;
    toState?: State;
}
