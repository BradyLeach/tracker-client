/**
 * StateRegistry Unit Tests
 *
 * The registry is a projection, so these run against the real store: a graph tree is
 * shredded in exactly as a response would be, and the lookups are read from what the
 * projection made of it. Only the definition endpoint is mocked, because that is the
 * network.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { stateRegistry } from '@/core/models/StateRegistry';
import { dataStore } from '@/services/dataStore/dataStore';
import { shred } from '@/services/dataService/shredder';
import
{
    makeStateGraph,
    makeStateGraphState,
    makeState,
    makeStateCategory,
    makeTransition,
    makeStateGraphDefinitions,
} from '@/test-factories/stateGraph';
import type { StateGraph } from '@/domains/state';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

/** Puts graphs in the store the way the bootstrap read does, then projects them. */
const project = async ( graphs: StateGraph[] ): Promise<void> =>
{
    await shred( graphs, 'stateGraph' );
    await stateRegistry.connect();
};

describe( 'StateRegistry', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStateGraphDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'state-registry-test-profile' );
    } );

    afterEach( async () =>
    {
        stateRegistry.disconnect();
        await dataStore.destroy();
    } );

    // -------------------------------------------------------------------------

    describe( 'connect()', () =>
    {
        it( 'resolves the lookups from records already in the store', async () =>
        {
            await project( [makeStateGraph()] );

            expect( stateRegistry.getGraph( 'graph-1' )?.name ).toBe( 'Partnership' );
            expect( stateRegistry.getStateGraphState( 'sgs-1' ) ).toBeDefined();
        } );

        it( 'rebuilds the nested tree the response arrived as', async () =>
        {
            await project( [makeStateGraph()] );

            const graph = stateRegistry.getGraph( 'graph-1' );

            expect( graph?.stateGraphState?.[0].id ).toBe( 'sgs-1' );
            expect( graph?.stateGraphState?.[0].state?.name ).toBe( 'Prospect' );
            expect( graph?.transition?.[0].id ).toBe( 'transition-1' );
        } );

        it( 'orders the nodes of a graph by sortOrder, whatever order they were stored in', async () =>
        {
            await project( [makeStateGraph( {
                stateGraphState: [
                    makeStateGraphState( { id: 'sgs-third', stateId: 'state-1', sortOrder: 3 } ),
                    makeStateGraphState( { id: 'sgs-first', stateId: 'state-1', sortOrder: 1 } ),
                    makeStateGraphState( { id: 'sgs-second', stateId: 'state-1', sortOrder: 2 } )
                ]
            } )] );

            const order = stateRegistry.getGraph( 'graph-1' )?.stateGraphState?.map( node => node.id );

            expect( order ).toEqual( ['sgs-first', 'sgs-second', 'sgs-third'] );
        } );

        it( 'reflects a later write without reconnecting', async () =>
        {
            await project( [makeStateGraph()] );

            await shred( [makeStateGraph( { id: 'graph-2', name: 'Order', stateGraphState: [], transition: [] } )], 'stateGraph' );

            // The projection is live: the store emitted, so the lookup answers without
            // anything re-running bootstrap.
            await vi.waitFor( () => expect( stateRegistry.getGraph( 'graph-2' )?.name ).toBe( 'Order' ) );
            expect( stateRegistry.getGraph( 'graph-1' ) ).toBeDefined();
        } );

        it( 'connecting twice leaves one live projection', async () =>
        {
            await project( [makeStateGraph()] );
            await stateRegistry.connect();

            await shred( [makeStateGraph( { id: 'graph-2', stateGraphState: [], transition: [] } )], 'stateGraph' );

            await vi.waitFor( () => expect( stateRegistry.getGraph( 'graph-2' ) ).toBeDefined() );
            expect( stateRegistry.getGraph( 'graph-1' ) ).toBeDefined();
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getState()', () =>
    {
        beforeEach( async () =>
        {
            const category = makeStateCategory( { color: 'success' } );
            const state = makeState( { id: 'state-1', name: 'Prospect', stateCategory: category } );
            const node = makeStateGraphState( { id: 'sgs-1', state } );

            await project( [makeStateGraph( { stateGraphState: [node] } )] );
        } );

        it( 'returns the nested state for a valid stateGraphState ID', () =>
        {
            const state = stateRegistry.getState( 'sgs-1' );

            expect( state?.name ).toBe( 'Prospect' );
            expect( state?.stateCategory?.color ).toBe( 'success' );
        } );

        it( 'returns undefined for an unknown ID', () =>
        {
            expect( stateRegistry.getState( 'unknown' ) ).toBeUndefined();
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getStateGraphState()', () =>
    {
        it( 'returns the full stateGraphState node including metadata', async () =>
        {
            const node = makeStateGraphState( { id: 'sgs-1', isDefault: true, isTerminal: false, sortOrder: 0 } );
            await project( [makeStateGraph( { stateGraphState: [node] } )] );

            const stored = stateRegistry.getStateGraphState( 'sgs-1' );

            expect( stored?.isDefault ).toBe( true );
            expect( stored?.isTerminal ).toBe( false );
            expect( stored?.sortOrder ).toBe( 0 );
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getGraph()', () =>
    {
        it( 'returns the graph for a valid ID', async () =>
        {
            await project( [makeStateGraph( { id: 'graph-1', name: 'Partnership' } )] );

            expect( stateRegistry.getGraph( 'graph-1' )?.name ).toBe( 'Partnership' );
        } );

        it( 'returns undefined for an unknown ID', async () =>
        {
            await project( [makeStateGraph()] );

            expect( stateRegistry.getGraph( 'unknown' ) ).toBeUndefined();
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getTransitions()', () =>
    {
        beforeEach( async () =>
        {
            const transitions = [
                makeTransition( { id: 't-1', fromStateGraphStateId: 'sgs-1', toStateGraphStateId: 'sgs-2' } ),
                makeTransition( { id: 't-2', fromStateGraphStateId: 'sgs-2', toStateGraphStateId: 'sgs-3' } ),
                makeTransition( { id: 't-entry', fromStateGraphStateId: undefined, toStateGraphStateId: 'sgs-1' } )
            ];

            await project( [makeStateGraph( { transition: transitions } )] );
        } );

        it( 'returns all transitions when no fromStateId provided', () =>
        {
            expect( stateRegistry.getTransitions( 'graph-1' ) ).toHaveLength( 3 );
        } );

        it( 'returns transitions from the given state, and not those from another', () =>
        {
            const result = stateRegistry.getTransitions( 'graph-1', 'sgs-1' ).map( transition => transition.id );

            expect( result ).toContain( 't-1' );
            expect( result ).not.toContain( 't-2' );
        } );

        it( 'includes universal transitions whatever the current state', () =>
        {
            // A transition with no fromStateGraphStateId is free movement — reachable
            // from anywhere — so it is offered alongside the state's own transitions.
            expect( stateRegistry.getTransitions( 'graph-1', 'sgs-1' ).map( transition => transition.id ) ).toContain( 't-entry' );
            expect( stateRegistry.getTransitions( 'graph-1', 'sgs-2' ).map( transition => transition.id ) ).toContain( 't-entry' );
        } );

        it( 'returns empty array for unknown graph', () =>
        {
            expect( stateRegistry.getTransitions( 'unknown' ) ).toEqual( [] );
        } );

        it( 'returns only the universal transitions for a state with none of its own', () =>
        {
            const result = stateRegistry.getTransitions( 'graph-1', 'sgs-99' ).map( transition => transition.id );

            expect( result ).toEqual( ['t-entry'] );
        } );
    } );
} );
