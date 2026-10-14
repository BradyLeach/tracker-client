/**
 * Held Collection Rows Unit Tests
 *
 * A collection's composed rows are held for the session, so a screen mounting again renders
 * what the store already answered. Run through the real store, the real factory and the real
 * hook — only the network and the definition endpoint are mocked.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { httpDataService as dataService } from '@/services/dataService/dataService';
import { dataStore } from '@/services/dataStore/dataStore';
import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DomainRecord } from '@/services/domain/createDomainStore';
import { joinOne } from '@/services/domain/joins';
import { useDataQuery } from '@/services/domain/useDataQuery';
import { makeStoreDefinitions, makeCompany, makePartnership } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

vi.mock( '@/services/dataService/dataService', () => ( {
    httpDataService: { getAll: vi.fn(), getOne: vi.fn(), update: vi.fn(), create: vi.fn(), post: vi.fn() }
} ) );

interface TestCompany extends DomainRecord { name?: string }
interface TestPartnership extends DomainRecord { companyId?: string; company?: TestCompany }

describe( 'held collection rows', () =>
{
    let partnerships: ReturnType<typeof createDomainStore<TestPartnership>>;

    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [makePartnership()] } );

        await modelRegistry.load();
        await dataStore.open( 'held-rows-test-profile' );
        await dataStore.write( 'company', [makeCompany()] );

        // Composed the way partnership.service is, so the held stream carries the join.
        partnerships = createDomainStore<TestPartnership>( {
            path: 'business/partnerships',
            model: 'partnership',
            compose: rows => joinOne<TestPartnership, TestCompany, 'company'>( 'partnership', rows, 'company', 'company' ),
        } );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    /** Mounts a collection screen's read and waits until its first fetch has settled. */
    async function mountSettled()
    {
        const hook = renderHook( () => useDataQuery( () => partnerships.observeAll(), [] ) );

        await waitFor( () => expect( hook.result.current.data ).toHaveLength( 1 ) );
        await waitFor( () => expect( hook.result.current.isFetching ).toBe( false ) );

        return hook;
    }

    it( 'renders held rows on a remount without a loading state', async () =>
    {
        const first = await mountSettled();
        first.unmount();

        // Navigating back: the store already answered, so nothing is left to wait on.
        const { result } = renderHook( () => useDataQuery( () => partnerships.observeAll(), [] ) );

        expect( result.current.isLoading ).toBe( false );
        expect( result.current.data ).toHaveLength( 1 );
        expect( result.current.data?.[0].company?.name ).toBe( 'Acme Soap' );
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );
    } );

    it( 're-emits when a related record changes, through the held join', async () =>
    {
        const { result } = await mountSettled();

        await act( async () =>
        {
            await dataStore.write( 'company', [makeCompany( { name: 'Renamed' } )] );
        } );

        await waitFor( () => expect( result.current.data?.[0].company?.name ).toBe( 'Renamed' ) );
    } );

    it( 'keeps a held row current while no screen is subscribed', async () =>
    {
        const first = await mountSettled();
        first.unmount();

        await dataStore.write( 'partnership', [makePartnership( { label: 'stockist' } )] );

        const { result } = renderHook( () => useDataQuery( () => partnerships.observeAll(), [] ) );

        await waitFor( () => expect( result.current.data?.[0] ).toMatchObject( { label: 'stockist' } ) );
    } );

    it( 'replays nothing from the previous session after teardown', async () =>
    {
        const previous = await mountSettled();

        await act( async () =>
        {
            await dataStore.destroy();
        } );

        // Disposed rather than left reading a closed database.
        expect( previous.result.current.isError ).toBe( false );
        previous.unmount();

        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );
        await dataStore.open( 'held-rows-next-profile' );

        const { result } = renderHook( () => useDataQuery( () => partnerships.observeAll(), [] ) );

        expect( result.current.data ).toBeUndefined();
        await waitFor( () => expect( result.current.data ).toEqual( [] ) );
        await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
    } );

    it( 'leaves a clause read unheld, so it waits on the store as before', async () =>
    {
        const first = await mountSettled();
        first.unmount();

        const { result } = renderHook( () => useDataQuery(
            () => partnerships.observeWhere( { companyId: 'company-1' } ),
            []
        ) );

        expect( result.current.data ).toBeUndefined();
        expect( result.current.isLoading ).toBe( true );

        await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );
    } );
} );
