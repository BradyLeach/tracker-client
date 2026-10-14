/**
 * Shredder Unit Tests
 *
 * The shredder writes through the real DataStore — no stand-in. Only the definition
 * endpoint is mocked, because that is the network; the association descriptors that drive
 * the tree walk, and the store the records land in, are the real ones.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { shred, tombstone } from '@/services/dataService/shredder';
import { makeStoreDefinitions, makeCompany, makePartnership } from '@/test-factories/dataStore';
import type { ModelDefinition } from '@/core/models/types';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

describe( 'shredder', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'shredder-test-profile' );
    } );

    afterEach( async () =>
    {
        // Destroying the store ends the session, which discards the tombstones with it.
        // Each test gets a clean slate through the mechanism the app uses, not a hatch.
        await dataStore.destroy();
    } );

    describe( 'flattening a response tree', () =>
    {
        it( 'stores each nested record in the table for its own model', async () =>
        {
            await shred( {
                ...makeCompany(),
                partnership: [
                    makePartnership( { id: 'partnership-1' } ),
                    makePartnership( { id: 'partnership-2' } )
                ]
            }, 'company' );

            const [company] = await dataStore.read( 'company', ['company-1'] );
            const partnerships = await dataStore.read( 'partnership', ['partnership-1', 'partnership-2'] );

            expect( company ).toMatchObject( { id: 'company-1', name: 'Acme Soap' } );
            expect( partnerships.map( row => row.id ).sort() ).toEqual( ['partnership-1', 'partnership-2'] );
        } );

        it( 'stores records flat — a parent keeps its own fields and no nested tree', async () =>
        {
            await shred( { ...makeCompany(), partnership: [makePartnership()] }, 'company' );

            const [company] = await dataStore.read( 'company', ['company-1'] );

            expect( company ).not.toHaveProperty( 'partnership' );
        } );

        it( 'keeps the foreign key on the child, which is what the edge is made of', async () =>
        {
            await shred( { ...makeCompany(), partnership: [makePartnership()] }, 'company' );

            const [partnership] = await dataStore.read( 'partnership', ['partnership-1'] );

            expect( partnership.companyId ).toBe( 'company-1' );
        } );

        it( 'walks a list response as readily as a single record', async () =>
        {
            await shred( [makeCompany( { id: 'company-1' } ), makeCompany( { id: 'company-2' } )], 'company' );

            expect( await dataStore.read( 'company', ['company-1', 'company-2'] ) ).toHaveLength( 2 );
        } );

        it( 'shreds a child response carrying its parent nested the other way', async () =>
        {
            await shred( { ...makePartnership(), company: makeCompany() }, 'partnership' );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
        } );
    } );

    describe( 'id-only stubs', () =>
    {
        it( 'does not let a pointer overwrite a fuller stored record', async () =>
        {
            await shred( makeCompany(), 'company' );

            await shred( { ...makePartnership(), company: { id: 'company-1' } }, 'partnership' );

            const [company] = await dataStore.read( 'company', ['company-1'] );

            expect( company.name ).toBe( 'Acme Soap' );
        } );

        it( 'still shreds the record the stub was nested under', async () =>
        {
            await shred( { ...makePartnership(), company: { id: 'company-1' } }, 'partnership' );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
        } );
    } );

    describe( 'out-of-order responses', () =>
    {
        it( 'does not let an older response overwrite newer data', async () =>
        {
            await shred( makeCompany( { name: 'Newer', updatedAt: '2026-02-01T00:00:00.000Z' } ), 'company' );
            await shred( makeCompany( { name: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' } ), 'company' );

            const [company] = await dataStore.read( 'company', ['company-1'] );

            expect( company.name ).toBe( 'Newer' );
        } );

        it( 'writes a newer response over an older stored record', async () =>
        {
            await shred( makeCompany( { name: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' } ), 'company' );
            await shred( makeCompany( { name: 'Newer', updatedAt: '2026-02-01T00:00:00.000Z' } ), 'company' );

            const [company] = await dataStore.read( 'company', ['company-1'] );

            expect( company.name ).toBe( 'Newer' );
        } );

        it( 'has no guard when a model carries no timestamp, and writes as received', async () =>
        {
            await shred( { id: 'company-1', name: 'First' }, 'company' );
            await shred( { id: 'company-1', name: 'Second' }, 'company' );

            const [company] = await dataStore.read( 'company', ['company-1'] );

            expect( company.name ).toBe( 'Second' );
        } );
    } );

    describe( 'tombstones', () =>
    {
        it( 'does not write back a deleted id arriving in an in-flight response', async () =>
        {
            tombstone( ['partnership-1'] );

            await shred( { ...makeCompany(), partnership: [makePartnership()] }, 'company' );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toEqual( [] );
            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
        } );

        it( 'does not write back an id deleted while the stored records are being read', async () =>
        {
            // The delete lands between the shredder's first tombstone check and its write —
            // the read of the stored records is the only await in that window. The spy only
            // times the event; the read, the tombstone and the removal are all the real ones.
            const realRead = dataStore.read.bind( dataStore );
            const readSpy = vi.spyOn( dataStore, 'read' ).mockImplementationOnce( async ( model, ids ) =>
            {
                const stored = await realRead( model, ids );

                tombstone( ['company-1'] );
                await dataStore.remove( 'company', ['company-1'] );

                return stored;
            } );

            try
            {
                await shred( makeCompany(), 'company' );

                expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
            }
            finally
            {
                readSpy.mockRestore();
            }
        } );

        it( 'stops guarding once the entry expires', async () =>
        {
            tombstone( ['partnership-1'] );

            // Entries expire after the HTTP timeout, since no response outlives the
            // request that produced it. Only Date is faked — Dexie's work is asynchronous
            // and faking its timers would stall the writes this test is waiting on.
            const { timeout } = ( await import( '@/config' ) ).getConfig().apiConfig;

            vi.useFakeTimers( { toFake: ['Date'] } );
            vi.setSystemTime( Date.now() + timeout + 1 );

            try
            {
                await shred( makePartnership(), 'partnership' );

                expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
            }
            finally
            {
                vi.useRealTimers();
            }
        } );

        it( 'clears on a restore so the record can come back', async () =>
        {
            tombstone( ['partnership-1'] );

            await shred( makePartnership(), 'partnership', { restores: true } );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
        } );

        it( 'clears only what the operation restored, not what it merely carried', async () =>
        {
            tombstone( ['partnership-1', 'company-1'] );

            await shred( { ...makePartnership(), company: makeCompany() }, 'partnership', { restores: true } );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
            expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
        } );

        it( 'discards every tombstone when the session ends', async () =>
        {
            tombstone( ['partnership-1'] );

            // Ending the session drops the database those ids named, so the guard goes
            // with it rather than outliving the records it was guarding.
            await dataStore.destroy();
            await dataStore.open( 'shredder-test-profile' );

            await shred( makePartnership(), 'partnership' );

            expect( await dataStore.read( 'partnership', ['partnership-1'] ) ).toHaveLength( 1 );
        } );
    } );

    describe( 'write failures', () =>
    {
        it( 'propagates a failed write on a mutation response', async () =>
        {
            // A closed store is a real failure through the real boundary: REST has
            // succeeded, so a swallowed error would leave a save that appears to do nothing.
            await dataStore.destroy();

            await expect( shred( makeCompany(), 'company', { mutation: true } ) ).rejects.toThrow( /no open store/i );
        } );

        it( 'logs and continues on a background read', async () =>
        {
            await dataStore.destroy();

            await expect( shred( makeCompany(), 'company' ) ).resolves.toBeUndefined();
        } );

        it( 'leaves the queue usable after a mutation failure', async () =>
        {
            await dataStore.destroy();
            await shred( makeCompany(), 'company', { mutation: true } ).catch( () => undefined );

            await dataStore.open( 'shredder-test-profile' );
            await shred( makeCompany(), 'company' );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
        } );
    } );

    /**
     * A many-to-many include arrives with each target carrying its junction row, as the
     * backend publishes it (asserted in saasy-soap's inventoryTypeRoute integration test).
     * The junction row is the only record of the link, so it must land in its own table.
     */
    describe( 'many-to-many includes', () =>
    {
        /** Descriptors in the shape the definition endpoint serializes them. */
        const manyToManyDefinitions = (): Record<string, ModelDefinition> => ( {
            ...makeStoreDefinitions(),
            inventoryType: {
                name: 'inventoryType',
                schema: { id: { type: 'uuidv4' }, name: { type: 'text' } },
                associations: {
                    recipeType: {
                        type: 'belongsToMany', target: 'recipeType', foreignKey: 'inventoryTypeId',
                        otherKey: 'recipeTypeId', via: 'inventoryTypeRecipeType',
                    },
                    materialGroup: {
                        type: 'belongsToMany', target: 'materialGroup', foreignKey: 'inventoryTypeId',
                        otherKey: 'materialGroupId', via: 'inventoryTypeMaterialGroup',
                    },
                },
            },
            recipeType: { name: 'recipeType', schema: { id: { type: 'uuidv4' }, label: { type: 'text' } } },
            materialGroup: { name: 'materialGroup', schema: { id: { type: 'uuidv4' }, label: { type: 'text' } } },
            inventoryTypeRecipeType: {
                name: 'inventoryTypeRecipeType',
                schema: { id: { type: 'uuidv4' }, inventoryTypeId: { type: 'uuidv4' }, recipeTypeId: { type: 'uuidv4' } },
                associations: {
                    inventoryType: { type: 'belongsTo', target: 'inventoryType', foreignKey: 'inventoryTypeId' },
                    recipeType: { type: 'belongsTo', target: 'recipeType', foreignKey: 'recipeTypeId' },
                },
            },
            inventoryTypeMaterialGroup: {
                name: 'inventoryTypeMaterialGroup',
                schema: { id: { type: 'uuidv4' }, inventoryTypeId: { type: 'uuidv4' }, materialGroupId: { type: 'uuidv4' } },
                associations: {
                    inventoryType: { type: 'belongsTo', target: 'inventoryType', foreignKey: 'inventoryTypeId' },
                    materialGroup: { type: 'belongsTo', target: 'materialGroup', foreignKey: 'materialGroupId' },
                },
            },
        } );

        const linkedInventoryType = () => ( {
            id: 'inventory-type-1',
            name: 'Olive Oil',
            recipeType: [{
                id: 'recipe-type-soap-bar',
                label: 'SoapBar',
                inventoryTypeRecipeType: { id: 'link-recipe-1', inventoryTypeId: 'inventory-type-1', recipeTypeId: 'recipe-type-soap-bar' },
            }],
            materialGroup: [{
                id: 'material-group-oil',
                label: 'Oil',
                inventoryTypeMaterialGroup: { id: 'link-group-1', inventoryTypeId: 'inventory-type-1', materialGroupId: 'material-group-oil' },
            }],
        } );

        beforeEach( async () =>
        {
            await dataStore.destroy();
            vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( { status: 200, data: manyToManyDefinitions() } );
            await modelRegistry.load();
            await dataStore.open( 'shredder-test-profile' );
        } );

        it( 'stores each junction row in its own table, keyed to both sides of the link', async () =>
        {
            await shred( linkedInventoryType(), 'inventoryType' );

            const [recipeLink] = await dataStore.read( 'inventoryTypeRecipeType', ['link-recipe-1'] );
            const [groupLink] = await dataStore.read( 'inventoryTypeMaterialGroup', ['link-group-1'] );

            expect( recipeLink ).toMatchObject( { inventoryTypeId: 'inventory-type-1', recipeTypeId: 'recipe-type-soap-bar' } );
            expect( groupLink ).toMatchObject( { inventoryTypeId: 'inventory-type-1', materialGroupId: 'material-group-oil' } );
        } );

        it( 'stores the targets flat, without the junction row nested in them', async () =>
        {
            await shred( linkedInventoryType(), 'inventoryType' );

            const [recipeType] = await dataStore.read( 'recipeType', ['recipe-type-soap-bar'] );
            const [inventoryType] = await dataStore.read( 'inventoryType', ['inventory-type-1'] );

            expect( recipeType ).toMatchObject( { id: 'recipe-type-soap-bar', label: 'SoapBar' } );
            expect( recipeType ).not.toHaveProperty( 'inventoryTypeRecipeType' );
            expect( inventoryType ).not.toHaveProperty( 'recipeType' );
            expect( inventoryType ).not.toHaveProperty( 'materialGroup' );
        } );
    } );
} );
