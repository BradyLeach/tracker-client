/**
 * StateRegistry
 *
 * A synchronous projection of the state graphs held in the store.
 *
 * Entities carry `currentStateId`, and rows, chips and steppers resolve one during render,
 * so the lookups have to be synchronous and O(1). Store reads are asynchronous, so the
 * registry keeps plain Maps and refreshes them when the store emits.
 *
 * It holds no fetch of its own. A graph arrives as a nested tree and is shredded into five
 * flat tables, so the projection is a join: the tree the lookups return is rebuilt here from
 * those tables rather than held as the server happened to send it.
 */
import { logger } from '@/core/utils/logger';
import { project, source } from '@/services/domain/projection';
import type { Projection } from '@/services/domain/projection';

import type { StateGraph, StateGraphState, State, StateCategory, Transition } from '@/domains/state';

class StateRegistry
{
    private graphMap: Map<string, StateGraph> = new Map();
    private stateNodeMap: Map<string, StateGraphState> = new Map();

    private graphs: StateGraph[] = [];
    private nodes: StateGraphState[] = [];
    private states: State[] = [];
    private categories: StateCategory[] = [];
    private transitions: Transition[] = [];

    private projection: Projection | undefined;

    /**
     * Subscribes to the five tables a graph is shredded into and keeps the lookup maps current.
     *
     * Called once by the post-login sequence, after the graphs have been shredded into the
     * store. Each table is observed independently and the tree is rebuilt once they have all
     * emitted, so there is no ordering to maintain between five collections that were one
     * response.
     *
     * Idempotent: connecting twice drops the first set of subscriptions rather than doubling
     * them.
     */
    async connect(): Promise<void>
    {
        this.disconnect();

        const { projection, ready } = project(
            [
                source<StateGraph>( 'stateGraph', records => { this.graphs = records; } ),
                source<StateGraphState>( 'stateGraphState', records => { this.nodes = records; } ),
                source<State>( 'state', records => { this.states = records; } ),
                source<StateCategory>( 'stateCategory', records => { this.categories = records; } ),
                source<Transition>( 'transition', records => { this.transitions = records; } )
            ],
            () => this._compose()
        );

        this.projection = projection;
        await ready;

        logger.debug( '[StateRegistry] Projecting', { graphs: this.graphMap.size, states: this.stateNodeMap.size } );
    }

    /** Drops the subscriptions. Called when the session ends and the store goes away. */
    disconnect(): void
    {
        this.projection?.stop();
        this.projection = undefined;
    }

    /**
     * Returns the State record for a given stateGraphState ID.
     * Entity currentStateId references stateGraphState.id — this resolves
     * the nested state (name + category) for display.
     *
     * @param stateGraphStateId - UUID of the stateGraphState node
     */
    getState( stateGraphStateId: string ): State | undefined
    {
        return this.stateNodeMap.get( stateGraphStateId )?.state;
    }

    /**
     * Returns the full StateGraphState node (includes sortOrder, isTerminal,
     * isDefault, and nested state) for a given stateGraphState ID.
     *
     * @param stateGraphStateId - UUID of the stateGraphState node
     */
    getStateGraphState( stateGraphStateId: string ): StateGraphState | undefined
    {
        return this.stateNodeMap.get( stateGraphStateId );
    }

    /**
     * Returns the StateGraph for the given graphId, or undefined if not found.
     *
     * @param graphId - UUID of the state graph
     */
    getGraph( graphId: string ): StateGraph | undefined
    {
        return this.graphMap.get( graphId );
    }

    /**
     * Returns transitions for a given graph, optionally filtered to those
     * originating from a specific state. Pass undefined fromStateId to get
     * all transitions in the graph.
     *
     * Transitions with no fromStateGraphStateId are universal — they are always
     * included regardless of the current state (free-movement transitions).
     *
     * @param graphId - UUID of the state graph
     * @param fromStateId - If provided, returns transitions from this state plus all universal transitions
     */
    getTransitions( graphId: string, fromStateId?: string ): Transition[]
    {
        const graph = this.graphMap.get( graphId );
        if( !graph?.transition ) return [];
        if( !fromStateId ) return graph.transition;
        return graph.transition.filter(
            transition => transition.fromStateGraphStateId === fromStateId
                || transition.fromStateGraphStateId === undefined
        );
    }

    // -------------------------------------------------------------------------

    /**
     * Rebuilds the graph tree from the flat tables.
     *
     * The lookups return the same nested shape the endpoint used to hand over, so callers
     * are unchanged — but it is composed here, from whatever the store currently holds,
     * rather than being whatever one response happened to carry.
     *
     * Nodes are ordered by `sortOrder`: a store read has no inherent order, and a stepper
     * rendering its steps in table order would be rendering them in no order at all.
     */
    private _compose(): void
    {
        const categoryById = new Map( this.categories.map( category => [category.id, category] ) );

        const stateById = new Map( this.states.map( state => [
            state.id,
            { ...state, stateCategory: categoryById.get( state.stateCategoryId ) }
        ] ) );

        const nodesByGraph = new Map<string, StateGraphState[]>();
        this.stateNodeMap.clear();

        for( const node of this.nodes )
        {
            const composed = { ...node, state: stateById.get( node.stateId ) };

            this.stateNodeMap.set( composed.id, composed );

            const held = nodesByGraph.get( composed.stateGraphId );
            if( held ) held.push( composed );
            else nodesByGraph.set( composed.stateGraphId, [composed] );
        }

        const transitionsByGraph = new Map<string, Transition[]>();

        for( const transition of this.transitions )
        {
            const held = transitionsByGraph.get( transition.stateGraphId );
            if( held ) held.push( transition );
            else transitionsByGraph.set( transition.stateGraphId, [transition] );
        }

        this.graphMap.clear();

        for( const graph of this.graphs )
        {
            this.graphMap.set( graph.id, {
                ...graph,
                stateGraphState: ( nodesByGraph.get( graph.id ) ?? [] )
                    .sort( ( left, right ) => left.sortOrder - right.sortOrder ),
                transition: transitionsByGraph.get( graph.id ) ?? []
            } );
        }
    }
}

export const stateRegistry = new StateRegistry();
