/**
 * Company and Partnership Domain Tests
 *
 * The migrated stack end to end: REST response → shredder → store → join → hook. Only
 * dataService is mocked, because that is the network. The store, the shredder, the joins and
 * the hook adapter are all the real ones.
 *
 * The assertions are about rendered values rather than "it loaded" — a missing composed
 * shape fails quietly as an em-dash in the table config, not as an error.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { httpDataService as dataService } from '@/services/dataService/dataService';
import { dataStore } from '@/services/dataStore/dataStore';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import { useCompanies } from '@/domains/business/company/hooks/useCompanies';
import { usePartnership } from '@/domains/business/partnership/hooks/usePartnership';
import { usePartnerships } from '@/domains/business/partnership/hooks/usePartnerships';
import { partnershipService } from '@/domains/business/partnership/services/partnership.service';
import { companyService } from '@/domains/business/company/services/company.service';
import { makeStoreDefinitions } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

// One object under both names: the domain store reads through `httpDataService`, while
// partnership.service still posts its transition through `dataService`.
const api = vi.hoisted( () => (
    { getAll: vi.fn(), getOne: vi.fn(), update: vi.fn(), create: vi.fn(), post: vi.fn() }
) );

vi.mock( '@/services/dataService/dataService', () => ( {
    httpDataService: api,
    dataService: api
} ) );

/** A partnership as the collection endpoint returns it — company nested by the include. */
const partnershipWithCompany = {
    id: 'partnership-1',
    companyId: 'company-1',
    partnershipTypeId: 'type-1',
    contactName: 'Jo Baker',
    updatedAt: '2026-01-02T00:00:00.000Z',
    company: { id: 'company-1', name: 'Acme Soap', updatedAt: '2026-01-02T00:00:00.000Z' }
};

describe( 'business domains over the store', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await modelRegistry.load();
        await dataStore.open( 'business-test-profile' );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    it( 'stores a nested company flat and composes it back onto the row', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [partnershipWithCompany] } );

        const { result } = renderHook( () => usePartnerships() );

        await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

        const [row] = result.current.data!;

        // What buildPartnershipsTableConfig renders. An em-dash here is the quiet failure.
        expect( row.company?.name ).toBe( 'Acme Soap' );
        expect( row.contactName ).toBe( 'Jo Baker' );

        // Stored flat: the record in the table carries its foreign key and nothing nested.
        const [stored] = await dataStore.read( 'partnership', ['partnership-1'] );
        expect( stored.companyId ).toBe( 'company-1' );
        expect( stored ).not.toHaveProperty( 'company' );
    } );

    it( 'fills the company collection from a partnership read, with no company fetch', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [partnershipWithCompany] } );

        const { result } = renderHook( () => usePartnerships() );
        await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

        // The company arrived nested under a partnership read and was normalised into its
        // own table — no entity is fetched twice because one screen already loaded it.
        expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
    } );

    it( 'updates every partnership row showing a company when that company is renamed', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [partnershipWithCompany] } );
        vi.mocked( dataService.update ).mockResolvedValue( {
            status: 200,
            data: { id: 'company-1', name: 'Renamed Soap', updatedAt: '2026-03-01T00:00:00.000Z' }
        } );

        const { result } = renderHook( () => usePartnerships() );
        await waitFor( () => expect( result.current.data?.[0].company?.name ).toBe( 'Acme Soap' ) );

        // Nothing in this test subscribes to companies. The rename reaches the row through
        // the store, which is the claim the whole composition exists to make.
        await act( async () =>
        {
            await companyService.update( 'company-1', { name: 'Renamed Soap' } );
        } );

        await waitFor( () => expect( result.current.data?.[0].company?.name ).toBe( 'Renamed Soap' ) );
    } );

    it( 'shows a partnership whose company has not arrived, rather than dropping the row', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( {
            status: 200,
            data: [{ ...partnershipWithCompany, company: undefined }]
        } );

        const { result } = renderHook( () => usePartnerships() );

        await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

        expect( result.current.data![0].company ).toBeUndefined();
        expect( result.current.data![0].contactName ).toBe( 'Jo Baker' );
    } );

    it( 'narrows a detail read to the record, still carrying its composed shape', async () =>
    {
        vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: partnershipWithCompany } );

        const { result } = renderHook( () => usePartnership( 'partnership-1' ) );

        await waitFor( () => expect( result.current.data?.id ).toBe( 'partnership-1' ) );

        // The factory narrows, so no domain repeats data?.[0] — and the record reads the
        // same as a table row would.
        expect( result.current.data?.company?.name ).toBe( 'Acme Soap' );
    } );

    it( 'stores the response of a domain RPC through the same path as a create or update', async () =>
    {
        vi.mocked( dataService.post ).mockResolvedValue( {
            status: 200,
            data: { ...partnershipWithCompany, company: undefined, currentStateGraphStateId: 'state-2' }
        } );

        await partnershipService.transition( 'partnership-1', 'transition-1' );

        const [stored] = await dataStore.read( 'partnership', ['partnership-1'] );
        expect( stored.currentStateGraphStateId ).toBe( 'state-2' );
    } );

    it( 'reports a cold miss as loading rather than empty', async () =>
    {
        type CompanyResponse = ApiResponse<unknown[]>;

        let release: ( value: CompanyResponse ) => void = () => undefined;
        const pending = new Promise<CompanyResponse>( resolve => { release = resolve; } );

        vi.mocked( dataService.getAll ).mockReturnValue( pending as ReturnType<typeof dataService.getAll> );

        const { result } = renderHook( () => useCompanies() );

        await waitFor( () => expect( result.current.isFetching ).toBe( true ) );
        expect( result.current.isLoading ).toBe( true );

        await act( async () => { release( { status: 200, data: [] } ); } );

        await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
        expect( result.current.isLoading ).toBe( false );
    } );
} );
