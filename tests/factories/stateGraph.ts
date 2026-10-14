/**
 * Test factories for state graph domain objects.
 *
 * Builds minimal but valid StateGraph, StateGraphState, State,
 * StateCategory and Transition objects for use in unit tests.
 */

import type { StateGraph, StateGraphState, State, StateCategory, Transition } from '@/domains/state';
import type { ModelDefinition } from '@/core/models/types';

/**
 * The five tables a state graph response is shredded into, in the shape the `/definition`
 * endpoint returns them.
 *
 * Every edge the tree carries is declared, because the shredder matches a nested key against
 * the association descriptors — an undeclared alias is treated as an ordinary field and the
 * nested records never reach their own table.
 */
export const makeStateGraphDefinitions = (): Record<string, ModelDefinition> => ( {
    stateGraph: {
        name: 'stateGraph',
        schema: {
            id: { type: 'uuidv4' },
            name: { type: 'text' },
            label: { type: 'text' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' },
        associations: {
            stateGraphState: { type: 'hasMany', target: 'stateGraphState', foreignKey: 'stateGraphId' },
            transition: { type: 'hasMany', target: 'transition', foreignKey: 'stateGraphId' }
        }
    },
    stateGraphState: {
        name: 'stateGraphState',
        schema: {
            id: { type: 'uuidv4' },
            stateGraphId: { type: 'uuidv4' },
            stateId: { type: 'uuidv4' },
            sortOrder: { type: 'integer' },
            isDefault: { type: 'boolean' },
            isTerminal: { type: 'boolean' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' },
        associations: {
            stateGraph: { type: 'belongsTo', target: 'stateGraph', foreignKey: 'stateGraphId' },
            state: { type: 'belongsTo', target: 'state', foreignKey: 'stateId' }
        }
    },
    state: {
        name: 'state',
        schema: {
            id: { type: 'uuidv4' },
            name: { type: 'text' },
            label: { type: 'text' },
            stateCategoryId: { type: 'uuidv4' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' },
        associations: {
            stateCategory: { type: 'belongsTo', target: 'stateCategory', foreignKey: 'stateCategoryId' }
        }
    },
    stateCategory: {
        name: 'stateCategory',
        schema: {
            id: { type: 'uuidv4' },
            name: { type: 'text' },
            color: { type: 'text' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' }
    },
    transition: {
        name: 'transition',
        schema: {
            id: { type: 'uuidv4' },
            stateGraphId: { type: 'uuidv4' },
            name: { type: 'text' },
            label: { type: 'text' },
            fromStateGraphStateId: { type: 'uuidv4' },
            toStateGraphStateId: { type: 'uuidv4' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' },
        associations: {
            stateGraph: { type: 'belongsTo', target: 'stateGraph', foreignKey: 'stateGraphId' }
        }
    }
} );

export const makeStateCategory = ( overrides: Partial<StateCategory> = {} ): StateCategory => ( {
    id: 'cat-1',
    name: 'Active',
    color: 'success',
    ...overrides,
} );

export const makeState = ( overrides: Partial<State> = {} ): State => ( {
    id: 'state-1',
    name: 'Prospect',
    label: 'prospect',
    stateCategoryId: 'cat-1',
    stateCategory: makeStateCategory(),
    ...overrides,
} );

export const makeStateGraphState = ( overrides: Partial<StateGraphState> = {} ): StateGraphState => ( {
    id: 'sgs-1',
    stateGraphId: 'graph-1',
    stateId: 'state-1',
    sortOrder: 0,
    isDefault: true,
    isTerminal: false,
    state: makeState(),
    ...overrides,
} );

export const makeTransition = ( overrides: Partial<Transition> = {} ): Transition => ( {
    id: 'transition-1',
    stateGraphId: 'graph-1',
    name: 'Activate',
    label: 'activate',
    fromStateGraphStateId: 'sgs-1',
    toStateGraphStateId: 'sgs-2',
    ...overrides,
} );

export const makeStateGraph = ( overrides: Partial<StateGraph> = {} ): StateGraph => ( {
    id: 'graph-1',
    name: 'Partnership',
    label: 'company',
    stateGraphState: [makeStateGraphState()],
    transition: [makeTransition()],
    ...overrides,
} );
