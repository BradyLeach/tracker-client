/**
 * Remove and Restore Unit Tests
 *
 * A delete is rarely one row, so these run through the real store and the real factory —
 * only dataService is mocked, because that is the network. What is under test is what the
 * client does with the consequence set Dawnshard reports, which is a question about the
 * store rather than about the request.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { httpDataService as dataService } from '@/services/dataService/dataService';
import { dataStore } from '@/services/dataStore/dataStore';
import { createDomainStore } from '@/services/domain/createDomainStore';
import { shred } from '@/services/dataService/shredder';
import { confirm, isSatisfied, scopeKey, scopesFor } from '@/services/domain/scope';
import { makeStoreDefinitions, makeCompany, makePartnership } from '@/test-factories/dataStore';
import type { DomainRecord } from '@/services/domain/createDomainStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

vi.mock( '@/services/dataService/dataService', () => ( {
    httpDataService: { getAll: vi.fn(), getOne: vi.fn(), update: vi.fn(), create: vi.fn(), post: vi.fn(), remove: vi.fn() }
} ) );

interface TestCompany extends DomainRecord
{
    name?: string;
}

/** Deleting a company takes its partnerships with it — dependants first, root last. */
const COMPANY_CASCADE = {
    records: {
        primary: [
            { modelName: 'partnership', ids: ['partnership-1', 'partnership-2'] },
            { modelName: 'company', ids: ['company-1'] }
        ],
        related: []
    }
};

/** The same delete, but a SET_NULL survivor comes back as a related record. */
const COMPANY_CASCADE_WITH_RELATED = {
    records: {
        primary: [
            { modelName: 'partnership', ids: ['partnership-1', 'partnership-2'] },
            { modelName: 'company', ids: ['company-1'] }
        ],
        related: [
            { modelName: 'order', ids: ['order-1'] }
        ]
    }
};

const companyStore = createDomainStore<TestCompany>( {
    path: 'business/companies',
    model: 'company',
    recordIncludes: ['partnership']
} );

describe( 'remove and restore', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'remove-restore-test-profile' );

        // A company and the two partnerships that hang off it, as a read would have left them.
        await shred( {
            ...makeCompany(),
            partnership: [
                makePartnership( { id: 'partnership-1' } ),
                makePartnership( { id: 'partnership-2' } )
            ]
        }, 'company' );
    } );

    afterEach( async () =>
    {
        // Destroying the store ends the session, which discards the tombstones with it.
        await dataStore.destroy();
        vi.resetAllMocks();
    } );

    // -------------------------------------------------------------------------

    describe( 'remove()', () =>
    {
        it( 'removes every model the server reported, not just the record asked for', async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );

            await companyStore.remove( 'company-1' );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 0 );
            expect( await dataStore.read( 'partnership', ['partnership-1', 'partnership-2'] ) ).toHaveLength( 0 );
        } );

        it( 'clears the record scope of every removed record, across the whole cascade', async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );

            await confirm( 'company', { id: 'company-1' } );
            await confirm( 'partnership', { id: 'partnership-1' } );

            await companyStore.remove( 'company-1' );

            expect( ( await scopesFor( 'company' ) ).map( scope => scope.id ) )
                .not.toContain( scopeKey( 'company', { id: 'company-1' } ) );
            expect( ( await scopesFor( 'partnership' ) ).map( scope => scope.id ) )
                .not.toContain( scopeKey( 'partnership', { id: 'partnership-1' } ) );
        } );

        it( 'tombstones the cascaded children, so a response in flight cannot write them back', async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );

            await companyStore.remove( 'company-1' );

            // A read generated before the delete, landing after it.
            await shred( {
                ...makeCompany(),
                partnership: [makePartnership( { id: 'partnership-1' } )]
            }, 'company' );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 0 );
            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 0 );
        } );

        it( 'leaves the store alone when the delete failed', async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 403, error: { key: 'permission.denied' } } );

            const response = await companyStore.remove( 'company-1' );

            expect( response.error ).toBeDefined();
            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
        } );

        it( 're-emits the collection without the removed rows', async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );
            await confirm( 'company', {} );

            await companyStore.remove( 'company-1' );

            const rows = await firstValueFrom( dataStore.observeWhere( 'company' ) );
            expect( rows ).toHaveLength( 0 );
        } );

        it( 'dirties a SET_NULL related record rather than tombstoning or removing it', async () =>
        {
            await shred( { id: 'order-1', companyId: 'company-1' }, 'order' );
            await confirm( 'order', {} );

            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE_WITH_RELATED } );

            await companyStore.remove( 'company-1' );

            // Still held — a related record was never deleted, only affected.
            expect( await dataStore.read( 'order', ['order-1'] ) ).toHaveLength( 1 );

            // But its scope is dirty, so the next read goes to the network rather than
            // reporting a completeness the SET_NULL may have broken.
            expect( await isSatisfied( 'order', {} ) ).toBe( false );
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'restore()', () =>
    {
        beforeEach( async () =>
        {
            vi.mocked( dataService.remove ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );
            await companyStore.remove( 'company-1' );
        } );

        it( 'reads the root back, because the response carries ids rather than records', async () =>
        {
            vi.mocked( dataService.post ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );
            vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: makeCompany() } );

            await companyStore.restore( 'company-1' );

            const [company] = await dataStore.read( 'company', ['company-1'] );
            expect( company?.name ).toBe( 'Acme Soap' );
        } );

        it( 'clears the tombstones for everything that came back, not only the root', async () =>
        {
            vi.mocked( dataService.post ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );
            vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: makeCompany() } );

            await companyStore.restore( 'company-1' );

            // Without the cleared tombstone this write would be discarded as a late response.
            await shred( makePartnership( { id: 'partnership-1' } ), 'partnership' );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
        } );

        it( 'marks the dependants dirty, so their next collection read goes to the network', async () =>
        {
            await confirm( 'partnership', {} );

            vi.mocked( dataService.post ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE } );
            vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: makeCompany() } );

            await companyStore.restore( 'company-1' );

            // Dirty reads as unsatisfied: the rows are back on the server, and nothing local
            // can know their fields until something fetches them.
            expect( await isSatisfied( 'partnership', {} ) ).toBe( false );
        } );

        it( 'leaves the record removed when the restore failed', async () =>
        {
            vi.mocked( dataService.post ).mockResolvedValue( { status: 404, error: { key: 'resource.notFound' } } );

            const response = await companyStore.restore( 'company-1' );

            expect( response.error ).toBeDefined();
            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 0 );
        } );

        it( 'dirties a SET_NULL related record rather than clearing a tombstone for it', async () =>
        {
            await shred( { id: 'order-1', companyId: 'company-1' }, 'order' );
            await confirm( 'order', {} );

            vi.mocked( dataService.post ).mockResolvedValue( { status: 200, data: COMPANY_CASCADE_WITH_RELATED } );
            vi.mocked( dataService.getOne ).mockResolvedValue( { status: 200, data: makeCompany() } );

            await companyStore.restore( 'company-1' );

            expect( await isSatisfied( 'order', {} ) ).toBe( false );
        } );
    } );
} );
