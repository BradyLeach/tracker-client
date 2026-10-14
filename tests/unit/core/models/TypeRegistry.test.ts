/**
 * TypeRegistry Unit Tests
 *
 * The registry is a projection, so these run against the real store: catalogs are shredded
 * in exactly as the aggregate response would be, and the lookups are read from what the
 * projection made of them. Only the definition endpoint is mocked, because that is the
 * network.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { dataStore } from '@/services/dataStore/dataStore';
import { shred } from '@/services/dataService/shredder';
import { makeSystemTypeDefinitions, makeSystemType } from '@/test-factories/systemType';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

const SUPPLIER = makeSystemType( { id: 'partnership-type-1', label: 'supplier' } );
const STOCKIST = makeSystemType( { id: 'partnership-type-2', label: 'stockist' } );
const BILLING = makeSystemType( { id: 'address-type-1', label: 'billing' } );

describe( 'TypeRegistry', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeSystemTypeDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'type-registry-test-profile' );

        await shred( [SUPPLIER, STOCKIST], 'partnershipType' );
        await shred( [BILLING], 'addressType' );
        await typeRegistry.connect();
    } );

    afterEach( async () =>
    {
        typeRegistry.disconnect();
        await dataStore.destroy();
    } );

    // -------------------------------------------------------------------------

    describe( 'getById()', () =>
    {
        it( 'returns the record whatever catalog it belongs to', () =>
        {
            expect( typeRegistry.getById( 'partnership-type-1' )?.label ).toBe( 'supplier' );
            expect( typeRegistry.getById( 'address-type-1' )?.label ).toBe( 'billing' );
        } );

        it( 'returns undefined for an unknown id, and for no id at all', () =>
        {
            expect( typeRegistry.getById( 'unknown' ) ).toBeUndefined();
            expect( typeRegistry.getById( undefined ) ).toBeUndefined();
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getLabel()', () =>
    {
        it( 'returns the label, which is also the i18n key', () =>
        {
            expect( typeRegistry.getLabel( 'partnership-type-2' ) ).toBe( 'stockist' );
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getByModel()', () =>
    {
        it( 'returns one catalog, keyed by its model name', () =>
        {
            expect( typeRegistry.getByModel( 'partnershipType' ).map( type => type.label ).sort() )
                .toEqual( ['stockist', 'supplier'] );
        } );

        it( 'returns an empty array for a catalog the store holds nothing for', () =>
        {
            expect( typeRegistry.getByModel( 'locationType' ) ).toEqual( [] );
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'getId()', () =>
    {
        it( 'resolves a catalog and label back to an id', () =>
        {
            expect( typeRegistry.getId( 'partnershipType', 'supplier' ) ).toBe( 'partnership-type-1' );
        } );

        it( 'does not resolve a label belonging to another catalog', () =>
        {
            expect( typeRegistry.getId( 'addressType', 'supplier' ) ).toBeUndefined();
        } );
    } );

    // -------------------------------------------------------------------------

    describe( 'the projection', () =>
    {
        it( 'reflects a later write without reconnecting', async () =>
        {
            await shred( [makeSystemType( { id: 'partnership-type-3', label: 'distributor' } )], 'partnershipType' );

            await vi.waitFor( () => expect( typeRegistry.getLabel( 'partnership-type-3' ) ).toBe( 'distributor' ) );
            expect( typeRegistry.getId( 'partnershipType', 'distributor' ) ).toBe( 'partnership-type-3' );
        } );

        it( 'stops answering new writes once disconnected', async () =>
        {
            typeRegistry.disconnect();

            await shred( [makeSystemType( { id: 'partnership-type-4', label: 'wholesaler' } )], 'partnershipType' );

            expect( typeRegistry.getById( 'partnership-type-4' ) ).toBeUndefined();
        } );
    } );
} );
