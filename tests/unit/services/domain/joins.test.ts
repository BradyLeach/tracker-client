/**
 * Join Helper Unit Tests
 *
 * Composed over the real store — the joins subscribe to live queries and the assertions are
 * about what they emit when either side changes. Only the definition endpoint is mocked,
 * because that is the network.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { joinOne, joinMany, joinHasOne, joinThrough } from '@/services/domain/joins';
import type { EntityRecord, Stream } from '@/services/dataStore/dataStore';
import type { ModelDefinition } from '@/core/models/types';
import { makeStoreDefinitions, makeCompany, makePartnership } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

/**
 * Subscribes and resolves once an emission satisfies `predicate`.
 *
 * A composed observable emits its current answer on subscribe and again on every change, so
 * a re-emit assertion has to wait for the answer it expects rather than read the first.
 */
function emissionMatching<T>( stream: Stream<T>, predicate: ( value: T ) => boolean ): Promise<T>
{
    return new Promise( ( resolve, reject ) =>
    {
        const timer = setTimeout( () =>
        {
            subscription.unsubscribe();
            reject( new Error( 'no matching emission' ) );
        }, 5000 );

        const subscription = stream.subscribe( value =>
        {
            if( !predicate( value ) ) return;

            clearTimeout( timer );
            subscription.unsubscribe();
            resolve( value );
        } );
    } );
}

const partnerships = () => dataStore.observeWhere<EntityRecord>( 'partnership' );
const companies = () => dataStore.observeWhere<EntityRecord>( 'company' );

describe( 'joins', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'joins-test-profile' );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
    } );

    describe( 'joinOne', () =>
    {
        it( 'attaches the record each row points at', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'partnership', [makePartnership()] );

            const joined = joinOne<EntityRecord, EntityRecord, 'company'>( 'partnership', partnerships(), 'company', 'company' );
            const [row] = await emissionMatching( joined, rows => rows[0]?.company !== undefined );

            expect( row.company ).toMatchObject( { id: 'company-1', name: 'Acme Soap' } );
            expect( row.id ).toBe( 'partnership-1' );
        } );

        it( 're-emits when the parent changes, with nothing subscribed to the parent collection', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'partnership', [makePartnership()] );

            const joined = joinOne<EntityRecord, EntityRecord, 'company'>( 'partnership', partnerships(), 'company', 'company' );
            const renamed = emissionMatching( joined, rows => rows[0]?.company?.name === 'Renamed' );

            // A company rename updates every partnership row showing it. This is the claim
            // the composition exists to make.
            await dataStore.write( 'company', [makeCompany( { name: 'Renamed' } )] );

            expect( ( await renamed )[0].company?.name ).toBe( 'Renamed' );
        } );

        it( 're-emits when a row is added', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'partnership', [makePartnership( { id: 'partnership-1' } )] );

            const joined = joinOne<EntityRecord, EntityRecord, 'company'>( 'partnership', partnerships(), 'company', 'company' );
            const grown = emissionMatching( joined, rows => rows.length === 2 );

            await dataStore.write( 'partnership', [makePartnership( { id: 'partnership-2' } )] );

            const rows = await grown;
            expect( rows.every( row => row.company?.id === 'company-1' ) ).toBe( true );
        } );

        it( 'keeps a row whose parent is not held, attaching undefined', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership( { companyId: 'company-missing' } )] );

            const joined = joinOne<EntityRecord, EntityRecord, 'company'>( 'partnership', partnerships(), 'company', 'company' );
            const [row] = await firstValueFrom( joined );

            expect( row.id ).toBe( 'partnership-1' );
            expect( row.company ).toBeUndefined();
        } );

        it( 'emits an empty result rather than querying for nothing', async () =>
        {
            const joined = joinOne<EntityRecord, EntityRecord, 'company'>( 'partnership', partnerships(), 'company', 'company' );

            expect( await firstValueFrom( joined ) ).toEqual( [] );
        } );
    } );

    describe( 'joinMany', () =>
    {
        it( 'attaches the records that point at each row', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'partnership', [
                makePartnership( { id: 'partnership-1' } ),
                makePartnership( { id: 'partnership-2' } )
            ] );

            const joined = joinMany( 'company', companies(), 'partnership', 'partnerships' );
            const [row] = await emissionMatching( joined, rows => ( rows[0]?.partnerships?.length ?? 0 ) === 2 );

            expect( row.partnerships.map( child => child.id ).sort() ).toEqual( ['partnership-1', 'partnership-2'] );
        } );

        it( 'attaches an empty collection to a row with no related records', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );

            const joined = joinMany( 'company', companies(), 'partnership', 'partnerships' );
            const [row] = await firstValueFrom( joined );

            expect( row.partnerships ).toEqual( [] );
        } );

        it( 'gives each row only its own children', async () =>
        {
            await dataStore.write( 'company', [makeCompany( { id: 'company-1' } ), makeCompany( { id: 'company-2' } )] );
            await dataStore.write( 'partnership', [
                makePartnership( { id: 'partnership-1', companyId: 'company-1' } ),
                makePartnership( { id: 'partnership-2', companyId: 'company-2' } )
            ] );

            const joined = joinMany( 'company', companies(), 'partnership', 'partnerships' );
            const rows = await emissionMatching( joined, current =>
                current.length === 2 && current.every( row => row.partnerships.length === 1 ) );

            const byId = new Map( rows.map( row => [row.id, row] ) );

            expect( byId.get( 'company-1' )?.partnerships[0].id ).toBe( 'partnership-1' );
            expect( byId.get( 'company-2' )?.partnerships[0].id ).toBe( 'partnership-2' );
        } );

        it( 're-emits when a child is added', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );

            const joined = joinMany( 'company', companies(), 'partnership', 'partnerships' );
            const grown = emissionMatching( joined, rows => ( rows[0]?.partnerships?.length ?? 0 ) === 1 );

            await dataStore.write( 'partnership', [makePartnership()] );

            expect( ( await grown )[0].partnerships[0].id ).toBe( 'partnership-1' );
        } );
    } );

    describe( 'association validation', () =>
    {
        it( 'rejects a model that is not loaded', () =>
        {
            expect( () => joinOne( 'nonesuch', partnerships(), 'company', 'company' ) )
                .toThrow( /not a loaded model definition/i );
        } );

        it( 'rejects an association the model does not declare, and says what it does', () =>
        {
            expect( () => joinOne( 'partnership', partnerships(), 'owner', 'owner' ) )
                .toThrow( /declares no association 'owner'.*company/is );
        } );

        it( 'rejects joining the wrong way down an edge', () =>
        {
            // partnership on company is a hasMany — the key lives on partnership, so each
            // company gains a collection, not a single record.
            expect( () => joinOne( 'company', companies(), 'partnership', 'partnership' ) )
                .toThrow( /hasMany.*Use joinMany instead/is );

            expect( () => joinMany( 'partnership', partnerships(), 'company', 'companies' ) )
                .toThrow( /belongsTo.*Use joinOne instead/is );

            expect( () => joinThrough( 'company', companies(), 'partnership', 'partnershipIds' ) )
                .toThrow( /hasMany.*Use joinMany instead/is );
        } );
    } );

    /**
     * A model whose edges share one foreign key, as inventoryType's do: two hasOne edges and
     * a belongsToMany, all keyed on inventoryTypeId. Descriptors are in the shape the
     * definition endpoint serializes them.
     */
    describe( 'edges sharing a foreign key', () =>
    {
        const sharedKeyDefinitions = (): Record<string, ModelDefinition> => ( {
            ...makeStoreDefinitions(),
            inventoryType: {
                name: 'inventoryType',
                schema: { id: { type: 'uuidv4' }, name: { type: 'text' } },
                associations: {
                    // Declared first, so matching by foreign key alone would always pick it.
                    oilProperty: { type: 'hasOne', target: 'oilProperty', foreignKey: 'inventoryTypeId' },
                    soapAdditiveEffect: { type: 'hasOne', target: 'soapAdditiveEffect', foreignKey: 'inventoryTypeId' },
                    recipeType: {
                        type: 'belongsToMany', target: 'recipeType', foreignKey: 'inventoryTypeId',
                        otherKey: 'recipeTypeId', via: 'inventoryTypeRecipeType',
                    },
                },
            },
            oilProperty: {
                name: 'oilProperty',
                schema: { id: { type: 'uuidv4' }, inventoryTypeId: { type: 'uuidv4' } },
                associations: { inventoryType: { type: 'belongsTo', target: 'inventoryType', foreignKey: 'inventoryTypeId' } },
            },
            soapAdditiveEffect: {
                name: 'soapAdditiveEffect',
                schema: { id: { type: 'uuidv4' }, inventoryTypeId: { type: 'uuidv4' } },
                associations: { inventoryType: { type: 'belongsTo', target: 'inventoryType', foreignKey: 'inventoryTypeId' } },
            },
            recipeType: { name: 'recipeType', schema: { id: { type: 'uuidv4' }, label: { type: 'text' } } },
            inventoryTypeRecipeType: {
                name: 'inventoryTypeRecipeType',
                schema: { id: { type: 'uuidv4' }, inventoryTypeId: { type: 'uuidv4' }, recipeTypeId: { type: 'uuidv4' } },
                associations: {
                    inventoryType: { type: 'belongsTo', target: 'inventoryType', foreignKey: 'inventoryTypeId' },
                    recipeType: { type: 'belongsTo', target: 'recipeType', foreignKey: 'recipeTypeId' },
                },
            },
        } );

        const inventoryTypes = () => dataStore.observeWhere<EntityRecord>( 'inventoryType' );

        beforeEach( async () =>
        {
            await dataStore.destroy();
            vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( { status: 200, data: sharedKeyDefinitions() } );
            await modelRegistry.load();
            await dataStore.open( 'joins-test-profile' );
        } );

        it( 'follows the named edge, not the first one holding the same key', async () =>
        {
            await dataStore.write( 'inventoryType', [{ id: 'type-1', name: 'Sodium lactate' }] );
            await dataStore.write( 'oilProperty', [{ id: 'oil-1', inventoryTypeId: 'type-1' }] );
            await dataStore.write( 'soapAdditiveEffect', [{ id: 'effect-1', inventoryTypeId: 'type-1' }] );

            const joined = joinHasOne<EntityRecord, EntityRecord, 'soapAdditiveEffect'>(
                'inventoryType', inventoryTypes(), 'soapAdditiveEffect', 'soapAdditiveEffect'
            );
            const [row] = await emissionMatching( joined, rows => rows[0]?.soapAdditiveEffect !== undefined );

            expect( row.soapAdditiveEffect?.id ).toBe( 'effect-1' );
        } );

        describe( 'joinThrough', () =>
        {
            it( 'attaches the ids each row links to through the junction model', async () =>
            {
                await dataStore.write( 'inventoryType', [{ id: 'type-1', name: 'Coconut Oil' }] );
                await dataStore.write( 'inventoryTypeRecipeType', [
                    { id: 'link-1', inventoryTypeId: 'type-1', recipeTypeId: 'soap-bar' },
                    { id: 'link-2', inventoryTypeId: 'type-1', recipeTypeId: 'candle' },
                ] );

                const joined = joinThrough( 'inventoryType', inventoryTypes(), 'recipeType', 'recipeTypeIds' );
                const [row] = await emissionMatching( joined, rows => ( rows[0]?.recipeTypeIds.length ?? 0 ) === 2 );

                expect( [...row.recipeTypeIds].sort() ).toEqual( ['candle', 'soap-bar'] );
            } );

            it( 'gives each row only its own links, and an empty list when it has none', async () =>
            {
                await dataStore.write( 'inventoryType', [{ id: 'type-1', name: 'Olive Oil' }, { id: 'type-2', name: 'White Clay' }] );
                await dataStore.write( 'inventoryTypeRecipeType', [{ id: 'link-1', inventoryTypeId: 'type-1', recipeTypeId: 'soap-bar' }] );

                const joined = joinThrough( 'inventoryType', inventoryTypes(), 'recipeType', 'recipeTypeIds' );
                const rows = await emissionMatching( joined, current =>
                    current.length === 2 && current.some( row => row.recipeTypeIds.length === 1 ) );
                const byId = new Map( rows.map( row => [row.id, row] ) );

                expect( byId.get( 'type-1' )?.recipeTypeIds ).toEqual( ['soap-bar'] );
                expect( byId.get( 'type-2' )?.recipeTypeIds ).toEqual( [] );
            } );

            it( 're-emits when a link is added, with nothing subscribed to the junction model', async () =>
            {
                await dataStore.write( 'inventoryType', [{ id: 'type-1', name: 'Olive Oil' }] );

                const joined = joinThrough( 'inventoryType', inventoryTypes(), 'recipeType', 'recipeTypeIds' );
                const linked = emissionMatching( joined, rows => ( rows[0]?.recipeTypeIds.length ?? 0 ) === 1 );

                await dataStore.write( 'inventoryTypeRecipeType', [{ id: 'link-1', inventoryTypeId: 'type-1', recipeTypeId: 'soap-bar' }] );

                expect( ( await linked )[0].recipeTypeIds ).toEqual( ['soap-bar'] );
            } );
        } );
    } );
} );
