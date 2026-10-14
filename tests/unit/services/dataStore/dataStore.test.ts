/**
 * DataStore Unit Tests
 *
 * Exercises the Dexie adapter against fake-indexeddb, which is a spec implementation
 * rather than a stand-in — the adapter runs as written. Only the definition endpoint is
 * mocked, because that is the network.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import type { EntityRecord } from '@/services/dataStore/dataStore';
import { makeStoreDefinitions, makeCompany, makePartnership } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: {
        getModelDefinitions: vi.fn(),
        getPublicModelDefinitions: vi.fn()
    }
} ) );

/**
 * Collects emissions from a stream until `predicate` is satisfied, then resolves.
 *
 * A live query emits its current answer on subscribe and again on every change, so a
 * re-emission test has to wait for the second answer rather than read the first.
 */
function nextMatching<T>( stream: { subscribe: ( o: ( value: T ) => void ) => { unsubscribe: () => void } },
    predicate: ( value: T ) => boolean ): Promise<T>
{
    return new Promise( ( resolve, reject ) =>
    {
        const timer = setTimeout( () =>
        {
            subscription.unsubscribe();
            reject( new Error( 'stream never emitted a matching value' ) );
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

describe( 'DataStore', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'store-test-profile' );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
    } );

    describe( 'lifecycle', () =>
    {
        it( 'reports an open store, and a destroyed one as closed', async () =>
        {
            expect( dataStore.isOpen() ).toBe( true );

            await dataStore.destroy();

            expect( dataStore.isOpen() ).toBe( false );
        } );

        it( 'drops the stored data on destroy, so the next session starts cold', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.destroy();

            await dataStore.open( 'store-test-profile' );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
        } );

        it( 'refuses reads once closed rather than answering from nothing', async () =>
        {
            await dataStore.destroy();

            await expect( dataStore.read( 'company', ['company-1'] ) ).rejects.toThrow( /no open store/i );
        } );
    } );

    describe( 'writes and reads', () =>
    {
        it( 'stores a record and reads it back whole', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );

            const [stored] = await dataStore.read( 'company', ['company-1'] );

            expect( stored ).toMatchObject( { id: 'company-1', name: 'Acme Soap' } );
        } );

        it( 'replaces the stored record of the same id', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'company', [makeCompany( { name: 'Renamed' } )] );

            const stored = await dataStore.read( 'company', ['company-1'] );

            expect( stored ).toHaveLength( 1 );
            expect( stored[0].name ).toBe( 'Renamed' );
        } );

        it( 'ignores unknown ids on read rather than returning holes', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );

            expect( await dataStore.read( 'company', ['company-1', 'missing'] ) ).toHaveLength( 1 );
        } );

        it( 'removes records by id', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.remove( 'company', ['company-1'] );

            expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
        } );

        it( 'empties one model on clear and leaves every other model holding its records', async () =>
        {
            await dataStore.write( 'company', [makeCompany()] );
            await dataStore.write( 'partnership', [makePartnership()] );

            await dataStore.clear( 'company' );

            expect( await dataStore.readWhere( 'company' ) ).toEqual( [] );
            expect( await dataStore.readWhere( 'partnership' ) ).toHaveLength( 1 );
        } );

        it( 'clears a model that holds nothing without failing', async () =>
        {
            await expect( dataStore.clear( 'company' ) ).resolves.toBeUndefined();
        } );
    } );

    describe( 'reactivity', () =>
    {
        it( 're-emits when a write lands', async () =>
        {
            // The reactivity the whole design rests on, so this asserts a second emission
            // rather than a populated first one — those are not the same claim.
            const emissions: EntityRecord[][] = [];
            const subscription = dataStore
                .observeWhere( 'partnership', { companyId: 'company-1' } )
                .subscribe( rows => emissions.push( rows ) );

            await vi.waitFor( () => expect( emissions ).toHaveLength( 1 ) );
            expect( emissions[0] ).toEqual( [] );

            await dataStore.write( 'partnership', [makePartnership()] );

            await vi.waitFor( () => expect( emissions ).toHaveLength( 2 ) );
            expect( emissions[1].map( row => row.id ) ).toEqual( ['partnership-1'] );

            subscription.unsubscribe();
        } );

        it( 're-emits when a record is removed', async () =>
        {
            await dataStore.write( 'partnership', [makePartnership()] );

            const emptied = nextMatching<EntityRecord[]>(
                dataStore.observeWhere( 'partnership', { companyId: 'company-1' } ),
                rows => rows.length === 0
            );

            await dataStore.remove( 'partnership', ['partnership-1'] );

            expect( await emptied ).toEqual( [] );
        } );

        it( 'observes one record by id, emitting undefined until it exists', async () =>
        {
            expect( await firstValueFrom( dataStore.observeById( 'company', 'company-1' ) ) ).toBeUndefined();

            const arrived = nextMatching<EntityRecord | undefined>(
                dataStore.observeById( 'company', 'company-1' ),
                record => record !== undefined
            );

            await dataStore.write( 'company', [makeCompany()] );

            expect( ( await arrived )?.name ).toBe( 'Acme Soap' );
        } );
    } );

    describe( 'edge traversal', () =>
    {
        beforeEach( async () =>
        {
            await dataStore.write( 'partnership', [
                makePartnership( { id: 'partnership-1', companyId: 'company-1' } ),
                makePartnership( { id: 'partnership-2', companyId: 'company-1' } ),
                makePartnership( { id: 'partnership-3', companyId: 'company-2' } )
            ] );
        } );

        it( 'returns the children of one parent and not another', async () =>
        {
            const rows = await firstValueFrom( dataStore.observeWhere( 'partnership', { companyId: 'company-1' } ) );

            expect( rows.map( row => row.id ).sort() ).toEqual( ['partnership-1', 'partnership-2'] );
        } );

        it( 'returns every record when no clause is given', async () =>
        {
            const rows = await firstValueFrom( dataStore.observeWhere( 'partnership' ) );

            expect( rows ).toHaveLength( 3 );
        } );

        it( 'matches a set with anyOf', async () =>
        {
            const rows = await firstValueFrom(
                dataStore.observeWhere( 'partnership', { id: { anyOf: ['partnership-1', 'partnership-3'] } } )
            );

            expect( rows.map( row => row.id ).sort() ).toEqual( ['partnership-1', 'partnership-3'] );
        } );

        it( 'applies every condition when a clause names more than one field', async () =>
        {
            const rows = await firstValueFrom(
                dataStore.observeWhere( 'partnership', { companyId: 'company-1', id: 'partnership-2' } )
            );

            expect( rows.map( row => row.id ) ).toEqual( ['partnership-2'] );
        } );

        it( 'matches an undefined value rather than rejecting it as a key', async () =>
        {
            // An id that has not resolved yet is an ordinary state while a parent loads.
            // undefined is not a valid IndexedDB key, so this has to match over the
            // records instead of seeking the index.
            const rows = await firstValueFrom( dataStore.observeWhere( 'partnership', { companyId: undefined } ) );

            expect( rows ).toEqual( [] );
        } );

        it( 'returns nothing for an empty anyOf', async () =>
        {
            const rows = await firstValueFrom( dataStore.observeWhere( 'partnership', { id: { anyOf: [] } } ) );

            expect( rows ).toEqual( [] );
        } );
    } );
} );
