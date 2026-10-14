/**
 * Realtime Service - Types
 *
 * Library-agnostic. Nothing here names Socket.IO, so swapping the transport is a
 * one-file change — mirrors the DataStore/Map port split.
 *
 * The port carries signal only: which record, which operation, a comparison
 * timestamp. Never content. REST remains the only way record content enters the
 * store — see client-data-architecture-design.md section 2.12.
 */

/**
 * One record inside a dirty batch.
 *
 * `timestamp` is present for every op except a hard delete — a deleted uuid can
 * never be mutated again, so there is nothing left to compare an ack against.
 */
export interface DirtyRecord
{
    id: string;
    timestamp?: string;
}

/** What changed, not the changed content. Same shape received live, recovered, and acked. */
export interface DirtyBatch
{
    modelName: string;
    op: string;

    /**
     * Profile that caused the change. Presentation metadata only — delivery and reconciliation
     * are identical whoever the instigator was, including for the instigator's own other devices.
     * A batch states one instigator, so a flush carrying two actors' changes to the same model
     * and op arrives as two batches.
     */
    instigatorId?: string;

    records: DirtyRecord[];
}

/** Response to a `recover` request on connect/reconnect. */
export interface RecoverResult
{
    /** Identifies the server process. A mismatch against the last-seen id means recovery cannot be trusted. */
    bootId: string;

    /** True when the device's ledger aged past the server's staleness window — `updates` is empty either way. */
    stale: boolean;

    /** Outstanding batches, processed through the same path as a live `dirty` delivery. */
    updates: DirtyBatch[];
}

/**
 * Realtime Adapter
 *
 * The port the application is written against. One authenticated connection per
 * device, carrying dirty broadcasts, recovery pulls and acks — REST is never part
 * of this protocol.
 */
export interface RealtimeAdapter
{
    /** Opens the authenticated connection. Safe to call once; reconnection is automatic. */
    connect(): void;

    /** Closes the connection. Never throws. */
    disconnect(): void;

    /**
     * Registers a handler for incoming dirty batches.
     * @returns Unsubscribe function.
     */
    onDirty( handler: ( batches: DirtyBatch[] ) => void ): () => void;

    /**
     * Registers a handler that fires after every successful connection, including the
     * first — reconnection is not distinguished from initial connect, because recovery
     * runs identically either way.
     * @returns Unsubscribe function.
     */
    onReconnect( handler: () => void ): () => void;

    /** Pulls this device's outstanding ledger entries over the already-authenticated connection. */
    recover(): Promise<RecoverResult>;

    /**
     * Acknowledges batches once their dirty state has been recorded locally.
     * Not conditional on a REST refetch — ack means "recorded", not "fetched".
     */
    ack( batches: DirtyBatch[] ): void;
}
