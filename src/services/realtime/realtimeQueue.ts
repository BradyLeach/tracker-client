/**
 * Realtime Queue
 *
 * Holds realtime dirty generations until they can be accepted into local dirty
 * state. Records retain their FIFO position while additional generations for
 * the same record accumulate behind them.
 */

import { Queue } from '@/core/utils/queue';
import { applyDirtyBatches } from '@/services/domain/realtimeSync';
import { realtimeService } from './realtime';
import { publishRealtimeChange } from './realtimeChange';
import { getProfileState } from '@/core/context/profile/Profile.context';
import type { DirtyBatch, DirtyRecord } from './realtime.types';
import { dataStore } from '@/services/dataStore/dataStore';

interface PendingGeneration
{
    op: string;
    instigatorId?: string;
    record: DirtyRecord;
}

interface PendingRealtimeRecord
{
    modelName: string;
    generations: PendingGeneration[];
}

const queue = new Queue<string, PendingRealtimeRecord>();

let processing = false;
let wakeRequested = false;

/**
 * Clears all pending realtime work for the current session.
 */
function clearRealtimeQueue(): void
{
    queue.clear();
    wakeRequested = false;
}

dataStore.onSessionEnd( clearRealtimeQueue );

/**
 * Whether a generation was caused by the profile using this device.
 *
 * An absent instigator is treated as someone else's: announcing a change that was not
 * this user's is a smaller cost than silently swallowing one that was.
 *
 * @param instigatorId - Profile the batch named as the cause.
 * @returns True when the change originated from the active profile.
 */
function isOwnChange( instigatorId?: string ): boolean
{
    return !!instigatorId && instigatorId === getProfileState().profile?.id;
}

/**
 * Creates the queue key for a realtime record.
 *
 * @param modelName - Model owning the record.
 * @param recordId - Record identifier.
 * @returns Stable queue key for the record.
 */
function queueKey( modelName: string, recordId: string ): string
{
    return `${modelName}:${recordId}`;
}

/**
 * Adds received dirty batches to the realtime queue.
 *
 * Existing records retain their FIFO position and accumulate additional
 * generations in arrival order.
 *
 * @param batches - Dirty batches received from the realtime service.
 */
export function enqueueRealtimeBatches( batches: DirtyBatch[] ): void
{
    for( const batch of batches )
    {
        for( const record of batch.records )
        {
            const key = queueKey( batch.modelName, record.id );
            const pending = queue.get( key );

            const generation: PendingGeneration = {
                op: batch.op,
                instigatorId: batch.instigatorId,
                record
            };

            if( pending )
            {
                pending.generations.push( generation );
                continue;
            }

            queue.push( key, {
                modelName: batch.modelName,
                generations: [generation]
            } );
        }
    }

    void processRealtimeQueue();
}

/**
 * Processes pending realtime generations in FIFO order.
 *
 * A generation remains queued while its record is already dirty. Wake requests
 * received while processing is active are retained so work cannot be stranded
 * between a reconciliation completing and the processor stopping.
 */
export async function processRealtimeQueue(): Promise<void>
{
    if( processing )
    {
        wakeRequested = true;
        return;
    }

    processing = true;

    try
    {
        do
        {
            wakeRequested = false;

            while( queue.size() > 0 )
            {
                const entry = queue.first();
                if( !entry ) break;

                const [ key, pending ] = entry;
                const generation = pending.generations[0];

                if( !generation )
                {
                    queue.pop( key );
                    continue;
                }

                const batch: DirtyBatch = {
                    modelName: pending.modelName,
                    op: generation.op,
                    records: [generation.record]
                };

                const result = await applyDirtyBatches( [batch] );
                if( result === 'already-dirty' ) break;

                // Accepted locally. Ahead of the ack: an ack is a message to the server,
                // and a failed one does not undo having received the change.
                //
                // A change this profile caused is still reconciled — it is only left
                // unannounced, because the user who made it does not need telling.
                if( result === 'marked' && !isOwnChange( generation.instigatorId ) )
                {
                    publishRealtimeChange( {
                        model: pending.modelName,
                        recordId: generation.record.id
                    } );
                }

                realtimeService.ack( [batch] );
                pending.generations.shift();

                if( pending.generations.length === 0 )
                {
                    queue.pop( key );
                }
            }
        }
        while( wakeRequested );
    }
    finally
    {
        processing = false;
    }
}