/**
 * RealtimeLoader Unit Tests
 *
 * The realtime transport is mocked — it is the external boundary — but scope,
 * shredder and the store are real, so ack/recovery behaviour is verified against
 * actual local state rather than against what the loader merely called.
 */

import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { confirm, isSatisfied } from '@/services/domain/scope';
import { makeStoreDefinitions } from '@/test-factories/dataStore';
import { RealtimeLoader } from '@/core/bootstrap/loaders/RealtimeLoader';
import { realtimeService } from '@/services/realtime/realtime';
import type { DirtyBatch, RecoverResult } from '@/services/realtime/realtime.types';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

vi.mock( '@/services/realtime/realtime', () => ( {
    realtimeService: {
        connect: vi.fn(),
        disconnect: vi.fn(),
        onDirty: vi.fn(),
        onReconnect: vi.fn(),
        recover: vi.fn(),
        ack: vi.fn()
    }
} ) );

let dirtyHandler: ( batches: DirtyBatch[] ) => void;
let reconnectHandler: () => void;

beforeEach( async () =>
{
    vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
        status: 200,
        data: makeStoreDefinitions()
    } );

    await modelRegistry.load();
    await dataStore.open( 'realtime-loader-test-profile' );
    window.localStorage.clear();

    vi.mocked( realtimeService.onDirty ).mockImplementation( handler =>
    {
        dirtyHandler = handler;
        return () => undefined;
    } );

    vi.mocked( realtimeService.onReconnect ).mockImplementation( handler =>
    {
        reconnectHandler = handler;
        return () => undefined;
    } );

    await new RealtimeLoader().load();
} );

afterEach( async () =>
{
    await dataStore.destroy();
    vi.resetAllMocks();
    window.localStorage.clear();
} );

it( 'acks a live dirty batch with the exact batch it received, timestamps included', async () =>
{
    const batch: DirtyBatch = {
        modelName: 'company',
        op: 'update',
        records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
    };

    dirtyHandler( [batch] );

    await vi.waitFor( () => expect( realtimeService.ack ).toHaveBeenCalledTimes( 1 ) );
    expect( realtimeService.ack ).toHaveBeenCalledWith( [batch] );
} );

it( 'processes and acks recovered batches through the same path as live delivery', async () =>
{
    await confirm( 'company', {} );

    const recovered: DirtyBatch = {
        modelName: 'company',
        op: 'update',
        records: [{ id: 'company-1', timestamp: '2026-01-01T00:00:00.000Z' }]
    };

    vi.mocked( realtimeService.recover ).mockResolvedValue(
        { bootId: 'boot-1', stale: false, updates: [recovered] } satisfies RecoverResult
    );

    reconnectHandler();

    await vi.waitFor( () => expect( realtimeService.ack ).toHaveBeenCalledWith( [recovered] ) );
    expect( await isSatisfied( 'company', {} ) ).toBe( false );
} );

it( 'invalidates every held scope, across every model, when recovery reports stale', async () =>
{
    await confirm( 'company', {} );
    await confirm( 'partnership', {} );

    vi.mocked( realtimeService.recover ).mockResolvedValue(
        { bootId: 'boot-1', stale: true, updates: [] } satisfies RecoverResult
    );

    reconnectHandler();

    await vi.waitFor( async () => expect( await isSatisfied( 'company', {} ) ).toBe( false ) );
    expect( await isSatisfied( 'partnership', {} ) ).toBe( false );

    // Stale recovery has nothing to ack — there is nothing it durably recorded.
    expect( realtimeService.ack ).not.toHaveBeenCalled();
} );

it( 'forces a full refresh on a boot id change, even when the server itself does not report stale', async () =>
{
    await confirm( 'company', {} );

    vi.mocked( realtimeService.recover ).mockResolvedValueOnce(
        { bootId: 'boot-1', stale: false, updates: [] } satisfies RecoverResult
    );
    reconnectHandler();

    // The first recovery is trusted: it is this session's first, with nothing local to
    // be wrong about, and it must not force an unnecessary refresh of what is already held.
    await vi.waitFor( () => expect( window.localStorage.getItem( 'trkc.realtime.bootId' ) ).toBe( 'boot-1' ) );
    expect( await isSatisfied( 'company', {} ) ).toBe( true );

    vi.mocked( realtimeService.recover ).mockResolvedValueOnce(
        { bootId: 'boot-2', stale: false, updates: [] } satisfies RecoverResult
    );
    reconnectHandler();

    // A server restart between the two recoveries — the ledger the second one reports as
    // empty is only empty because it is new, not because nothing happened while it was gone.
    await vi.waitFor( async () => expect( await isSatisfied( 'company', {} ) ).toBe( false ) );
} );
