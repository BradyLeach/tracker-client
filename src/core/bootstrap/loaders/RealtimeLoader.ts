/**
 * Opens the realtime connection and wires dirty/recovery delivery into local
 * invalidation state.
 *
 * Registered after DataStoreLoader in the post-login sequence: incoming dirty
 * state is persisted through the local data layer, which has to exist first.
 *
 * Non-critical. Realtime narrows *when* a screen refetches; it never supplies
 * content. A connection failure degrades to a stale screen until the next
 * natural fetch, never to a boot failure.
 */

import { dataStore } from '@/services/dataStore/dataStore';
import { realtimeService } from '@/services/realtime/realtime';
import { invalidateAllHeldScopes } from '@/services/domain/realtimeSync';
import { logger } from '@/core/utils/logger';
import { enqueueRealtimeBatches } from '@/services/realtime/realtimeQueue';
import type { BootstrapLoader } from '../types';

/**
 * Identifies the server process a recovery response came from.
 *
 * The server's own `stale` flag does not by itself catch a restart: a fresh
 * process can legitimately report an empty, non-stale ledger for a device it has
 * only just re-registered, which is indistinguishable from "nothing happened"
 * unless the boot id is compared. Persisted so it survives a page refresh — a
 * refresh keeps the Dexie store (2.8), and treating every refresh as a boot
 * mismatch would force a needless full refetch of data already held correctly.
 */
const BOOT_ID_KEY = 'trkc.realtime.bootId';

function lastSeenBootId(): string | undefined
{
    try
    {
        return window.localStorage.getItem( BOOT_ID_KEY ) ?? undefined;
    }
    catch
    {
        return undefined;
    }
}

function rememberBootId( bootId: string ): void
{
    try
    {
        window.localStorage.setItem( BOOT_ID_KEY, bootId );
    }
    catch ( error )
    {
        logger.warn( 'Realtime → could not persist boot id', { error } );
    }
}

function clearBootId(): void
{
    try
    {
        window.localStorage.removeItem( BOOT_ID_KEY );
    }
    catch ( error )
    {
        logger.warn( 'Realtime → could not clear boot id', { error } );
    }
}

// The next login is always cold, so a boot id from a previous session describes
// a store that no longer exists.
dataStore.onSessionEnd( clearBootId );

export class RealtimeLoader implements BootstrapLoader<void>
{
    name = 'realtime';
    critical = false;

    /**
     * Registers realtime dirty and reconnect handlers, then opens the realtime connection.
     *
     * @returns Promise resolved once realtime initialization is complete.
     */
    async load(): Promise<void>
    {
        realtimeService.onDirty( batches =>
        {
            enqueueRealtimeBatches( batches );
        } );

        // Fires on every successful connection, including the first — recovery
        // runs identically on initial connect and on reconnect after a drop.
        realtimeService.onReconnect( () => { void this.recover(); } );

        realtimeService.connect();
    }

    /**
     * Pulls the device's outstanding ledger entries on every successful connection.
     *
     * A stale ledger or a boot id that does not match the last one seen falls back to a
     * full refresh; anything else is queued through the same path a live delivery takes.
     *
     * @returns Promise resolved once the recovery response has been handled.
     */
    private async recover(): Promise<void>
    {
        let result;

        try
        {
            result = await realtimeService.recover();
        }
        catch ( error )
        {
            logger.warn( 'Realtime → recovery request failed', { error } );
            return;
        }

        const knownBootId = lastSeenBootId();

        // No known boot id means a cold session with nothing held locally to be
        // wrong about — only an id that actually changed forces a full refresh.
        const bootMismatch = knownBootId !== undefined && knownBootId !== result.bootId;

        rememberBootId( result.bootId );

        if( result.stale || bootMismatch )
        {
            await invalidateAllHeldScopes();
            return;
        }

        if( result.updates.length === 0 ) return;

        enqueueRealtimeBatches( result.updates );
    }
}
