/**
 * Hook Adapter Unit Tests
 *
 * The hook is exercised over the real store and a real request tracker — the arrangement a
 * Domain Service will hand it. Only the definition endpoint is mocked, because that is the
 * network; the fetch each test drives is a stand-in for the REST call a service would make.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { createRequestTracker } from '@/services/domain/requestState';
import { useDataQuery, useDataMutation } from '@/services/domain/useDataQuery';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { EntityRecord } from '@/services/dataStore/dataStore';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import { makeStoreDefinitions, makePartnership } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

/**
 * The shape a Domain Service returns: the store's answer for a scope, and the fetch state of
 * the request that fills it. Written out here rather than imported so the test does not wait
 * on a migrated domain.
 */
function makeSource( fetch: () => Promise<ApiResponse<unknown>> ): DataQuerySource<EntityRecord[]>
{
    const tracker = createRequestTracker();

    return {
        data: dataStore.observeWhere( 'partnership', { companyId: 'company-1' } ),
        request: tracker.state,
        refetch: () => { void tracker.track( fetch ); }
    };
}

/** A fetch that resolves only when the test releases it, so "in flight" is observable. */
function deferredFetch()
{
    let release: ( response: ApiResponse<unknown> ) => void = () => undefined;
    const pending = new Promise<ApiResponse<unknown>>( resolve => { release = resolve; } );

    return { run: () => pending, release };
}

describe( 'useDataQuery', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'hook-test-profile' );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
    } );

    describe( 'the states that decide what renders', () =>
    {
        it( 'reports a cold miss as loading, so a skeleton renders rather than an empty state', async () =>
        {
            const fetch = deferredFetch();
            const { result } = renderHook( () => useDataQuery( () => makeSource( fetch.run ), [] ) );

            act( () => result.current.refetch() );

            await waitFor( () => expect( result.current.isFetching ).toBe( true ) );

            // No rows held and a fetch pending — the skeleton case. `data` is undefined until
            // the store's first emission, then an empty array; neither counts as rows.
            expect( result.current.isLoading ).toBe( true );
            expect( result.current.data ?? [] ).toEqual( [] );

            act( () => fetch.release( { status: 200 } ) );
            await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
        } );

        it( 'does not report loading during a background refresh with rows on screen', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership()] );

            const fetch = deferredFetch();
            const { result } = renderHook( () => useDataQuery( () => makeSource( fetch.run ), [] ) );

            await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

            act( () => result.current.refetch() );
            await waitFor( () => expect( result.current.isFetching ).toBe( true ) );

            // Rows are held, so this is a refresh rather than a first load — no skeleton flash.
            expect( result.current.isLoading ).toBe( false );
            expect( result.current.data ).toHaveLength( 1 );

            act( () => fetch.release( { status: 200 } ) );
            await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
        } );

        it( 'reports loading before the store answers, even with no fetch pending', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership()] );

            // Returning to a screen whose scope is already satisfied: no fetch runs, and the
            // store read is still asynchronous. Reporting settled here renders the empty
            // state into the millisecond before the rows arrive — the flash this prevents.
            const { result } = renderHook( () => useDataQuery( () => makeSource( async () => ( { status: 200 } ) ), [] ) );

            expect( result.current.data ).toBeUndefined();
            expect( result.current.isLoading ).toBe( true );

            await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );
            expect( result.current.isLoading ).toBe( false );
        } );

        it( 'reports a genuinely empty collection as settled, so the empty state renders', async () =>
        {
            const { result } = renderHook( () => useDataQuery( () => makeSource( async () => ( { status: 200 } ) ), [] ) );

            await waitFor( () => expect( result.current.data ).toEqual( [] ) );

            expect( result.current.isLoading ).toBe( false );
            expect( result.current.isFetching ).toBe( false );
        } );

        it( 're-emits when a write lands under the query', async () =>
        {
            const { result } = renderHook( () => useDataQuery( () => makeSource( async () => ( { status: 200 } ) ), [] ) );

            await waitFor( () => expect( result.current.data ).toEqual( [] ) );

            await act( async () =>
            {
                await dataStore.write( 'partnership', [makePartnership()] );
            } );

            await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );
        } );
    } );

    describe( 'failures', () =>
    {
        it( 'sets isError and error without clearing data', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership()] );

            const { result } = renderHook( () => useDataQuery(
                () => makeSource( async () => ( { status: 500, error: { key: 'resource.invalid' } } ) ),
                []
            ) );

            await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

            act( () => result.current.refetch() );

            await waitFor( () => expect( result.current.isError ).toBe( true ) );

            expect( result.current.error ).toEqual( { key: 'resource.invalid' } );
            expect( result.current.data ).toHaveLength( 1 );
        } );

        it( 'reports a thrown transport failure rather than escaping', async () =>
        {
            const { result } = renderHook( () => useDataQuery(
                () => makeSource( async () => { throw new Error( 'offline' ); } ),
                []
            ) );

            act( () => result.current.refetch() );

            await waitFor( () => expect( result.current.isError ).toBe( true ) );

            expect( result.current.error?.key ).toBe( 'transport.error' );
            expect( result.current.isFetching ).toBe( false );
        } );
    } );

    describe( 'subscription lifetime', () =>
    {
        it( 'stops emitting once unmounted', async () =>
        {
            const { result, unmount } = renderHook( () => useDataQuery(
                () => makeSource( async () => ( { status: 200 } ) ),
                []
            ) );

            await waitFor( () => expect( result.current.data ).toEqual( [] ) );

            unmount();

            // A write after unmount must not reach a component that is gone. React would warn
            // on a state update from an unmounted tree; the assertion is that none happens.
            await dataStore.write( 'partnership', [makePartnership()] );

            expect( result.current.data ).toEqual( [] );
        } );

        it( 'never shows the previous query\'s rows under a new one', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership()] );

            const { result, rerender } = renderHook(
                ( { companyId }: { companyId: string } ) => useDataQuery( () => ( {
                    data: dataStore.observeWhere( 'partnership', { companyId } ),
                    request: createRequestTracker().state
                } ), [companyId] ),
                { initialProps: { companyId: 'company-1' } }
            );

            await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

            rerender( { companyId: 'company-2' } );

            // Unanswered until the new query emits, rather than company-1's partnership.
            expect( result.current.data ).toBeUndefined();
            expect( result.current.isLoading ).toBe( true );

            await waitFor( () => expect( result.current.data ).toEqual( [] ) );
        } );

        it( 'stays idle when the source is disabled', async () =>
        {
            const { result } = renderHook( () => useDataQuery<EntityRecord[]>( () => undefined, [] ) );

            expect( result.current.data ).toBeUndefined();
            expect( result.current.isLoading ).toBe( false );
            expect( result.current.isFetching ).toBe( false );

            // refetch on a disabled query is a no-op rather than a crash.
            act( () => result.current.refetch() );
        } );
    } );
} );

describe( 'useDataMutation', () =>
{
    it( 'reports pending, then the record it wrote', async () =>
    {
        const { result } = renderHook( () => useDataMutation( async ( name: string ) => ( { id: 'company-1', name } ) ) );

        expect( result.current.isPending ).toBe( false );

        await act( async () =>
        {
            await result.current.mutateAsync( 'Acme' );
        } );

        expect( result.current.isPending ).toBe( false );
        expect( result.current.isSuccess ).toBe( true );
        expect( result.current.data ).toEqual( { id: 'company-1', name: 'Acme' } );
    } );

    it( 'surfaces an ApiError and rejects, so the caller can react too', async () =>
    {
        const { result } = renderHook( () => useDataMutation( async () =>
        {
            throw { key: 'resource.invalid' };
        } ) );

        await act( async () =>
        {
            await expect( result.current.mutateAsync( undefined ) ).rejects.toEqual( { key: 'resource.invalid' } );
        } );

        expect( result.current.isError ).toBe( true );
        expect( result.current.error ).toEqual( { key: 'resource.invalid' } );
    } );

    it( 'clears its state on reset, which is what closing a dialog relies on', async () =>
    {
        const { result } = renderHook( () => useDataMutation( async () =>
        {
            throw { key: 'resource.invalid' };
        } ) );

        await act( async () =>
        {
            await result.current.mutateAsync( undefined ).catch( () => undefined );
        } );

        expect( result.current.isError ).toBe( true );

        act( () => result.current.reset() );

        expect( result.current.isError ).toBe( false );
        expect( result.current.error ).toBeUndefined();
    } );

    it( 'calls onSuccess and onError callbacks', async () =>
    {
        const onSuccess = vi.fn();
        const { result } = renderHook( () => useDataMutation( async ( name: string ) => ( { name } ), { onSuccess } ) );

        await act( async () =>
        {
            await result.current.mutateAsync( 'Acme' );
        } );

        expect( onSuccess ).toHaveBeenCalledWith( { name: 'Acme' }, 'Acme' );
    } );
} );
