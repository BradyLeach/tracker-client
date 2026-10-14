/**
 * Realtime Sync
 *
 * What a dirty batch means for local state. Sits beside scope.ts and the shredder
 * call sites it already shares with createDomainStore — the realtime transport
 * (services/realtime) carries signal only and knows nothing of tombstones or scope;
 * this is where that signal is translated into the same local invalidation
 * mechanism any other write already uses.
 *
 * One function handles live delivery and recovered batches identically, per the
 * ticket: there is no second implementation for the recovery path.
 */

import { clearTombstones, tombstone } from '@/services/dataService/shredder';
import { dataStore } from '@/services/dataStore/dataStore';
import { clearRecordScope, markAllDirty, markDirty } from './scope';
import type { MarkDirtyResult } from './scope';
import type { DirtyBatch, DirtyRecord } from '@/services/realtime/realtime.types';

/**
 * Op values as the backend's ACTIONS module emits them
 * (`dawnshard/app/core/engine/access/actions.js`). Realtime batches are grouped by
 * `(modelName, op)` server-side, so a batch's op is always exactly one of these.
 */
const OP = {
    REMOVE: 'remove',
    DELETE: 'delete',
    RESTORE: 'restore'
} as const;

/**
 * Applies one realtime dirty record to local invalidation state.
 *
 * A hard delete cannot be resurrected by an in-flight REST response — tombstoning
 * before marking dirty closes that race the same way a local delete does. A
 * restore clears the tombstone first, or the shredder's own guard would silently
 * drop the next write for that id.
 *
 * @param batch - Dirty batch containing the model and operation.
 * @param record - Specific record generation being applied.
 * @returns Result describing whether the record was marked, already dirty, or not held.
 */
async function applyRecord( batch: DirtyBatch, record: DirtyRecord ): Promise<MarkDirtyResult>
{
    switch ( batch.op )
    {
        case OP.REMOVE:
        case OP.DELETE:
            tombstone( [record.id] );
            await dataStore.remove( batch.modelName, [record.id] );
            await clearRecordScope( batch.modelName, record.id );
            break;
        case OP.RESTORE:
            clearTombstones( [record.id] );
            break;
    }

    return await markDirty( batch.modelName );
}

/**
 * Applies realtime dirty batches to local invalidation state.
 *
 * @param batches - Dirty batches to apply.
 * @returns Result describing whether the generation was recorded, deferred, or not held.
 */
export async function applyDirtyBatches( batches: DirtyBatch[] ): Promise<MarkDirtyResult>
{
    let result: MarkDirtyResult = 'not-held';

    for( const batch of batches )
    {
        for( const record of batch.records )
        {
            result = await applyRecord( batch, record );

            if( result !== 'not-held' ) return result;
        }
    }

    return result;
}

/**
 * Marks all currently held scopes dirty.
 *
 * The stale-recovery fallback: which held scopes a missed event broke cannot be
 * derived from what's left of the ledger, so every held scope is invalidated and
 * the normal data layer rebuilds authoritative state from REST as each is next read.
 *
 * @returns Promise resolved when invalidation is complete.
 */
export function invalidateAllHeldScopes(): Promise<void>
{
    return markAllDirty();
}
