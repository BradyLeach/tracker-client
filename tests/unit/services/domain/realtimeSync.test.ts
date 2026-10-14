/**
 * Realtime Sync Unit Tests
 *
 * What a dirty batch does to local state — tombstones, scope, and the store — run
 * through the real store and the real shredder. There is no network involved on
 * this path, so nothing here is mocked.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { shred } from '@/services/dataService/shredder';
import { confirm, isSatisfied, scopeKey, scopesFor } from '@/services/domain/scope';
import { applyDirtyBatches, invalidateAllHeldScopes } from '@/services/domain/realtimeSync';
import { makeStoreDefinitions, makeCompany } from '@/test-factories/dataStore';
import type { DirtyBatch } from '@/services/realtime/realtime.types';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

beforeEach( async () =>
{
    vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
        status: 200,
        data: makeStoreDefinitions()
    } );

    await modelRegistry.load();
    await dataStore.open( 'realtime-sync-test-profile' );
    await shred( makeCompany(), 'company' );
} );

afterEach( async () =>
{
    await dataStore.destroy();
    vi.resetAllMocks();
} );

describe( 'applyDirtyBatches', () =>
{
    it( 'marks the model dirty for an ordinary update, leaving the record alone', async () =>
    {
        await confirm( 'company', {} );

        const batch: DirtyBatch = {
            modelName: 'company',
            op: 'update',
            records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
        };
        await applyDirtyBatches( [batch] );

        expect( await isSatisfied( 'company', {} ) ).toBe( false );
        expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
    } );

    it( 'removes the record on a hard delete, reaching the state the deleting client is in', async () =>
    {
        const batch: DirtyBatch = { modelName: 'company', op: 'delete', records: [{ id: 'company-1' }] };
        await applyDirtyBatches( [batch] );

        expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
    } );

    it( 'removes the record on a soft remove the same way as a hard delete', async () =>
    {
        const batch: DirtyBatch = {
            modelName: 'company',
            op: 'remove',
            records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
        };
        await applyDirtyBatches( [batch] );

        expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
    } );

    it( 'tombstones a deleted id, so a response already in flight cannot write it back', async () =>
    {
        // A response generated before the delete, landing after it, must not resurrect the
        // row the delete just removed.
        await applyDirtyBatches( [{ modelName: 'company', op: 'delete', records: [{ id: 'company-1' }] }] );

        await shred( makeCompany( { name: 'Stale read, landed late' } ), 'company' );

        expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );
    } );

    it( 'clears the record scope on a hard delete, leaving nothing owed for an id that is gone', async () =>
    {
        // What a detail read leaves behind: a scope claiming that record is held.
        await confirm( 'company', { id: 'company-1' } );

        await applyDirtyBatches( [{ modelName: 'company', op: 'delete', records: [{ id: 'company-1' }] }] );

        const held = await scopesFor( 'company' );
        expect( held.map( scope => scope.id ) ).not.toContain( scopeKey( 'company', { id: 'company-1' } ) );
    } );

    it( 'clears the record scope on a soft remove too, since the record read cannot return it either', async () =>
    {
        await confirm( 'company', { id: 'company-1' } );

        await applyDirtyBatches( [{
            modelName: 'company',
            op: 'remove',
            records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
        }] );

        const held = await scopesFor( 'company' );
        expect( held.map( scope => scope.id ) ).not.toContain( scopeKey( 'company', { id: 'company-1' } ) );
    } );

    it( 'leaves the collection scope in place, dirty, when a record scope is cleared', async () =>
    {
        await confirm( 'company', {} );
        await confirm( 'company', { id: 'company-1' } );

        await applyDirtyBatches( [{ modelName: 'company', op: 'delete', records: [{ id: 'company-1' }] }] );

        const held = await scopesFor( 'company' );
        expect( held.map( scope => scope.id ) ).toEqual( [scopeKey( 'company', {} )] );
        expect( held[0].state ).toBe( 'dirty' );
    } );

    it( 'removes only the named record, leaving the rest of the collection held', async () =>
    {
        await shred( makeCompany( { id: 'company-2', name: 'Borax' } ), 'company' );

        await applyDirtyBatches( [{ modelName: 'company', op: 'delete', records: [{ id: 'company-1' }] }] );

        const held = await dataStore.readWhere( 'company' );
        expect( held.map( record => record.id ) ).toEqual( ['company-2'] );
    } );

    it( 'clears the tombstone on a restore, so the reconcile read brings the record back', async () =>
    {
        await applyDirtyBatches( [{
            modelName: 'company',
            op: 'remove',
            records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
        }] );

        expect( await dataStore.read( 'company', ['company-1'] ) ).toEqual( [] );

        const restore: DirtyBatch = {
            modelName: 'company',
            op: 'restore',
            records: [{ id: 'company-1', timestamp: '2026-01-02T00:00:00.000Z' }]
        };
        await applyDirtyBatches( [restore] );

        // Stands in for the refetch the dirty scope triggers — without the tombstone
        // cleared, the shredder's own guard would drop it.
        await shred( makeCompany(), 'company' );

        expect( await dataStore.read( 'company', ['company-1'] ) ).toHaveLength( 1 );
    } );

    it( 'processes a recovered batch through the same path as a live one', async () =>
    {
        await confirm( 'company', {} );

        // Shape recover() hands back under RecoverResult.updates — same DirtyBatch[].
        const recovered: DirtyBatch[] = [{
            modelName: 'company',
            op: 'update',
            records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
        }];
        await applyDirtyBatches( recovered );

        expect( await isSatisfied( 'company', {} ) ).toBe( false );
    } );
} );

describe( 'invalidateAllHeldScopes', () =>
{
    it( 'marks every held scope dirty, across every model, for the stale-recovery fallback', async () =>
    {
        await confirm( 'company', {} );
        await confirm( 'partnership', { companyId: 'company-1' } );

        await invalidateAllHeldScopes();

        expect( await isSatisfied( 'company', {} ) ).toBe( false );
        expect( await isSatisfied( 'partnership', { companyId: 'company-1' } ) ).toBe( false );
    } );
} );
