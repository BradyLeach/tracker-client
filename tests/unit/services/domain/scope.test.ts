/**
 * Scope Unit Tests
 *
 * The subset test is pure and tested directly. Everything else runs through the real store
 * and the real factory — only dataService is mocked, because that is the network, and the
 * question these tests ask is precisely whether it gets called.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { httpDataService as dataService } from '@/services/dataService/dataService';
import { dataStore } from '@/services/dataStore/dataStore';
import { createDomainStore } from '@/services/domain/createDomainStore';
import { clearScopes, confirm, isSatisfied, isWithin, markDirty, scopeKey } from '@/services/domain/scope';
import type { DomainRecord } from '@/services/domain/createDomainStore';
import { makeStoreDefinitions } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

vi.mock( '@/services/dataService/dataService', () => ( {
    httpDataService: { getAll: vi.fn(), getOne: vi.fn(), update: vi.fn(), create: vi.fn(), post: vi.fn() }
} ) );

describe( 'the subset test', () =>
{
    it( 'treats a filter with fewer constraints as broader', () =>
    {
        expect( isWithin( { companyId: 'c1' }, {} ) ).toBe( true );
        expect( isWithin( {}, { companyId: 'c1' } ) ).toBe( false );
    } );

    it( 'compares equality', () =>
    {
        expect( isWithin( { status: 'draft' }, { status: 'draft' } ) ).toBe( true );
        expect( isWithin( { status: 'sent' }, { status: 'draft' } ) ).toBe( false );
    } );

    it( 'compares anyOf as set membership', () =>
    {
        expect( isWithin( { status: 'draft' }, { status: { anyOf: ['draft', 'sent'] } } ) ).toBe( true );
        expect( isWithin( { status: { anyOf: ['draft'] } }, { status: { anyOf: ['draft', 'sent'] } } ) ).toBe( true );
        expect( isWithin( { status: { anyOf: ['draft', 'void'] } }, { status: { anyOf: ['draft', 'sent'] } } ) ).toBe( false );
    } );

    it( 'compares ranges, including the bound itself', () =>
    {
        const held = { orderedOn: { moreThan: '2025-01-01', lessThan: '2026-01-01' } };

        expect( isWithin( { orderedOn: '2025-06-01' }, held ) ).toBe( true );
        expect( isWithin( { orderedOn: '2024-06-01' }, held ) ).toBe( false );
        expect( isWithin( { orderedOn: { moreThan: '2025-06-01', lessThan: '2025-09-01' } }, held ) ).toBe( true );
        expect( isWithin( { orderedOn: { moreThan: '2024-06-01', lessThan: '2025-09-01' } }, held ) ).toBe( false );

        // An inclusive bound admits a value an exclusive one does not, so it is not a subset.
        expect( isWithin( { orderedOn: { moreThanOrEqual: '2025-01-01' } }, held ) ).toBe( false );
    } );

    it( 'falls through to a fetch for anything it cannot compare', () =>
    {
        // Failing toward a network call is safe; failing toward "assume we hold it" is not.
        expect( isWithin( { name: { like: 'ac%' } }, { name: { like: 'ac%' } } ) ).toBe( false );
        expect( isWithin( { status: 'draft' }, { status: { noneOf: ['void'] } } ) ).toBe( false );
    } );
} );

describe( 'canonical scope keys', () =>
{
    it( 'resolves equivalent filters to one key', () =>
    {
        expect( scopeKey( 'order', { a: 1, b: 2 } ) ).toBe( scopeKey( 'order', { b: 2, a: 1 } ) );
    } );

    it( 'ignores the order of an anyOf, which is a set', () =>
    {
        expect( scopeKey( 'order', { status: { anyOf: ['draft', 'sent'] } } ) )
            .toBe( scopeKey( 'order', { status: { anyOf: ['sent', 'draft'] } } ) );
    } );

    it( 'keeps different filters apart', () =>
    {
        expect( scopeKey( 'order', { a: 1 } ) ).not.toBe( scopeKey( 'order', { a: 2 } ) );
        expect( scopeKey( 'order', { a: 1 } ) ).not.toBe( scopeKey( 'company', { a: 1 } ) );
    } );
} );

describe( 'scope over the store', () =>
{
    interface TestCompany extends DomainRecord { name?: string }

    let companies: ReturnType<typeof createDomainStore<TestCompany>>;

    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await modelRegistry.load();
        await dataStore.open( 'scope-test-profile' );

        companies = createDomainStore<TestCompany>( {
            path: 'business/companies',
            model: 'company',
            collectionIncludes: ['partnership'],
            recordIncludes: ['partnership'],
        } );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    it( 'issues no request for a screen revisited within its fetched scope', async () =>
    {
        await companies.ensureCollectionLoaded();
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );

        await companies.ensureCollectionLoaded();
        await companies.ensureCollectionLoaded( { ownerId: 'account-1' } );

        // The second is the same scope; the third is narrower, so both are inside it.
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'fetches when the filter falls outside what is held', async () =>
    {
        // The first read refreshes, which fetches the whole collection and confirms it —
        // so the subset test is exercised from the narrower scopes held after it.
        await companies.ensureCollectionLoaded( { ownerId: 'account-1' } );
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );

        await clearScopes( 'company' );
        await confirm( 'company', { ownerId: 'account-1' } );

        await companies.ensureCollectionLoaded( { ownerId: 'account-1' } );
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );

        await companies.ensureCollectionLoaded( { ownerId: 'account-2' } );
        expect( dataService.getAll ).toHaveBeenCalledTimes( 2 );
    } );

    it( 'reads a dirty scope as unsatisfied', async () =>
    {
        await companies.ensureCollectionLoaded();
        expect( await isSatisfied( 'company', {} ) ).toBe( true );

        await markDirty( 'company' );

        expect( await isSatisfied( 'company', {} ) ).toBe( false );

        await companies.ensureCollectionLoaded();
        expect( dataService.getAll ).toHaveBeenCalledTimes( 2 );
    } );

    it( 'serves a traversal locally when an include already satisfied the edge', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( {
            status: 200,
            data: [{ id: 'company-1', name: 'Acme', partnership: [{ id: 'partnership-1', companyId: 'company-1' }] }]
        } );

        await companies.ensureCollectionLoaded();

        // A company returned with its partnerships means the server returned all of them,
        // so the edge is complete for that company.
        expect( await isSatisfied( 'partnership', { companyId: 'company-1' } ) ).toBe( true );
        expect( await isSatisfied( 'partnership', { companyId: 'company-2' } ) ).toBe( false );
    } );

    it( 'pages until the server says there is no more, and only then confirms', async () =>
    {
        vi.mocked( dataService.getAll )
            .mockResolvedValueOnce( {
                status: 200,
                data: [{ id: 'company-1', name: 'Acme' }],
                meta: { total: 2, hasMore: true }
            } )
            .mockResolvedValueOnce( {
                status: 200,
                data: [{ id: 'company-2', name: 'Borax' }],
                meta: { total: 2, hasMore: false }
            } );

        await companies.ensureCollectionLoaded();

        expect( dataService.getAll ).toHaveBeenCalledTimes( 2 );
        expect( await dataStore.read( 'company', ['company-1', 'company-2'] ) ).toHaveLength( 2 );
        expect( await isSatisfied( 'company', {} ) ).toBe( true );
    } );

    it( 'leaves a scope unsatisfied when a page fails, so the next read retries', async () =>
    {
        // Past the first read, whose refresh would otherwise consume the paged responses.
        await companies.ensureCollectionLoaded();
        await markDirty( 'company' );

        vi.mocked( dataService.getAll )
            .mockResolvedValueOnce( { status: 200, data: [{ id: 'company-1', name: 'Acme' }], meta: { total: 2, hasMore: true } } )
            .mockResolvedValueOnce( { status: 500, error: { key: 'resource.invalid' } } );

        await companies.ensureCollectionLoaded();

        // The first page is in the store and readable — partial is not a fourth state.
        expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
        expect( await isSatisfied( 'company', {} ) ).toBe( false );
    } );

    it( 'sends includeMeta, because hasMore is what closes a scope', async () =>
    {
        await companies.ensureCollectionLoaded();

        expect( dataService.getAll ).toHaveBeenCalledWith(
            'business/companies',
            expect.objectContaining( { includeMeta: true } )
        );
    } );

    it( 'skips a record fetch once the record is covered by a confirmed scope', async () =>
    {
        vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: { id: 'company-1', name: 'Acme' } } );

        await companies.ensureRecordLoaded( 'company-1' );
        expect( dataService.getOne ).toHaveBeenCalledTimes( 1 );

        await companies.ensureRecordLoaded( 'company-1' );
        expect( dataService.getOne ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'survives a confirm for a filter it has never seen', async () =>
    {
        await confirm( 'company', { ownerId: 'account-9' } );

        expect( await isSatisfied( 'company', { ownerId: 'account-9' } ) ).toBe( true );
        expect( await isSatisfied( 'company', {} ) ).toBe( false );
    } );
} );

describe( 'reactive scope refresh', () =>
{
    interface TestCompany extends DomainRecord { name?: string }

    let companies: ReturnType<typeof createDomainStore<TestCompany>>;

    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'reactive-scope-test-profile' );

        companies = createDomainStore<TestCompany>( { path: 'business/companies', model: 'company' } );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    it( 'refetches a dirty held collection scope without being asked again', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [{ id: 'company-1', name: 'Acme' }] } );

        // Starts the domain's one scope-table subscription and satisfies the collection scope.
        companies.observeAll();
        await vi.waitFor( () => expect( dataService.getAll ).toHaveBeenCalledTimes( 1 ) );
        await vi.waitFor( async () => expect( await isSatisfied( 'company', {} ) ).toBe( true ) );

        await markDirty( 'company' );

        // No caller re-invoked ensureCollectionLoaded — the domain's own subscription reacted.
        await vi.waitFor( () => expect( dataService.getAll ).toHaveBeenCalledTimes( 2 ) );
        await vi.waitFor( async () => expect( await isSatisfied( 'company', {} ) ).toBe( true ) );
    } );

    it( 'refetches a dirty held record scope through fetchRecord, not the collection path', async () =>
    {
        vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: { id: 'company-1', name: 'Acme' } } );

        companies.observeById( 'company-1' );
        await vi.waitFor( () => expect( dataService.getOne ).toHaveBeenCalledTimes( 1 ) );
        await vi.waitFor( async () => expect( await isSatisfied( 'company', { id: 'company-1' } ) ).toBe( true ) );

        await markDirty( 'company' );

        await vi.waitFor( () => expect( dataService.getOne ).toHaveBeenCalledTimes( 2 ) );
        await vi.waitFor( async () => expect( await isSatisfied( 'company', { id: 'company-1' } ) ).toBe( true ) );
        expect( dataService.getAll ).not.toHaveBeenCalled();
    } );
} );

describe( 'collection refresh', () =>
{
    interface TestCompany extends DomainRecord { name?: string }

    let companies: ReturnType<typeof createDomainStore<TestCompany>>;

    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'refresh-test-profile' );

        companies = createDomainStore<TestCompany>( { path: 'business/companies', model: 'company' } );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    it( 'drops a record the server no longer returns', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( {
            status: 200,
            data: [{ id: 'company-1', name: 'Acme' }, { id: 'company-2', name: 'Borax' }]
        } );

        await companies.ensureCollectionLoaded();
        expect( await dataStore.readWhere( 'company' ) ).toHaveLength( 2 );

        // The deleted company is simply absent from the next response.
        vi.mocked( dataService.getAll ).mockResolvedValue( {
            status: 200,
            data: [{ id: 'company-1', name: 'Acme' }]
        } );

        await companies.refresh();

        const held = await dataStore.readWhere( 'company' );
        expect( held.map( record => record.id ) ).toEqual( ['company-1'] );
    } );

    it( 'fetches again rather than reading the satisfied scope it just cleared', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await companies.ensureCollectionLoaded();
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );

        await companies.refresh();

        expect( dataService.getAll ).toHaveBeenCalledTimes( 2 );
        expect( await isSatisfied( 'company', {} ) ).toBe( true );
    } );

    it( 'leaves another model\'s records and scopes untouched', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await dataStore.write( 'partnership', [{ id: 'partnership-1', companyId: 'company-1' }] );
        await confirm( 'partnership', {} );

        await companies.refresh();

        expect( await dataStore.readWhere( 'partnership' ) ).toHaveLength( 1 );
        expect( await isSatisfied( 'partnership', {} ) ).toBe( true );
    } );

    it( 'discards state a previous application load left behind, on the first read', async () =>
    {
        // What a reload finds: entities and a satisfied scope persisted by a process that
        // is gone, one of them naming a record the server no longer returns.
        await dataStore.write( 'company', [{ id: 'company-1', name: 'Acme' }, { id: 'company-2', name: 'Gone' }] );
        await confirm( 'company', {} );

        vi.mocked( dataService.getAll ).mockResolvedValue( {
            status: 200,
            data: [{ id: 'company-1', name: 'Acme' }]
        } );

        const reloaded = createDomainStore<TestCompany>( { path: 'business/companies', model: 'company' } );
        await reloaded.ensureCollectionLoaded();

        const held = await dataStore.readWhere( 'company' );
        expect( held.map( record => record.id ) ).toEqual( ['company-1'] );
        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'refreshes once for the first read and reads locally after it', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await companies.ensureCollectionLoaded();
        await companies.ensureCollectionLoaded();
        await companies.ensureCollectionLoaded();

        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'refreshes once when concurrent first reads arrive together', async () =>
    {
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await Promise.all( [
            companies.ensureCollectionLoaded(),
            companies.ensureCollectionLoaded(),
            companies.ensureCollectionLoaded()
        ] );

        expect( dataService.getAll ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'retries the first-read refresh after one that failed', async () =>
    {
        // The clear is what fails here — a transport failure resolves rather than throwing.
        const clear = vi.spyOn( dataStore, 'clear' ).mockRejectedValueOnce( new Error( 'store closed' ) );
        vi.mocked( dataService.getAll ).mockResolvedValue( { status: 200, data: [] } );

        await expect( companies.ensureCollectionLoaded() ).rejects.toThrow( 'store closed' );

        await companies.ensureCollectionLoaded();

        expect( clear ).toHaveBeenCalledTimes( 2 );
        expect( await isSatisfied( 'company', {} ) ).toBe( true );

        clear.mockRestore();
    } );
} );
