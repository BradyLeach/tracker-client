/**
 * DataStore Types
 *
 * The port the application is written against. Same port/adapter split the DataService
 * uses for its HTTP transport: app code names this file, never the engine behind it.
 *
 * Nothing here exposes an engine object. There is no database handle, no collection
 * handle and no document proxy on this surface — a port that re-exports an engine
 * instance is defeated by one deliberate import, and the import lint cannot see it.
 */

import type { Observable } from 'rxjs';

/**
 * A live value that re-emits on every change.
 *
 * The alias exists so domain services declare `Stream<Company>` and never name `rxjs`
 * in a signature. Swapping the engine changes this line, not the call sites.
 */
export type Stream<T> = Observable<T>;

/**
 * A stored record. Flat by construction — the shredder removes nested trees before
 * anything reaches the store, so a record carries its own foreign keys and nothing else.
 *
 * The index signature is what an untyped caller gets. It is deliberately *not* the read
 * constraint: a TypeScript interface has no implicit index signature, so requiring one would
 * exclude every real domain type — `Company`, `Partnership` — from the methods that return
 * them. Reads are constrained to `Keyed` instead, which is all the store actually needs.
 */
export interface EntityRecord extends Keyed
{
    [field: string]: unknown;
}

/** The one thing the store requires of anything it stores: a uuid to key it by. */
export interface Keyed
{
    id: string;
}

/** Scalar a `where` clause can compare against. */
export type WhereScalar = string | number | boolean | undefined;

/**
 * The comparison vocabulary, a subset of the `where` DSL the app already sends to Dawnshard.
 *
 * Equality and `anyOf` are all an edge traversal needs. Ranges, text matching and sorting
 * are view operations over a hydrated array and belong to `useCollection`; growing this
 * toward Dawnshard's full operator set would duplicate `runCollection` inside the data layer.
 */
export interface WhereComparison
{
    anyOf?: readonly WhereScalar[];
}

/**
 * Field-to-condition map. A bare scalar is equality, so the common case
 * `{ companyId: id }` reads as it means.
 */
export type Where = Record<string, WhereScalar | WhereComparison>;

/** Identity of the signed-in actor, keyed by the owner type a model declares. */
export interface ActorIdentity
{
    account?: string;
    profile?: string;
    identity?: string;
}

/**
 * DataStore Interface
 *
 * One collection per model, keyed by uuid, indexed on the foreign keys of the model graph.
 * Reads are streams; writes are promises.
 */
export interface DataStore
{
    // ===================================================================
    // LIFECYCLE
    // ===================================================================

    /**
     * Opens the store for a profile, declaring a table per loaded model.
     *
     * Session validity is the caller's concern, not the store's: the refresh-token mechanism
     * already owns session lifetime, and the caller is post-login bootstrap, which has
     * already validated it. The store makes no network calls of its own.
     *
     * @param profileId - Profile of the already-validated session the store is scoped to.
     */
    open( profileId: string ): Promise<void>;

    /** True while a store is open in this tab. */
    isOpen(): boolean;

    /**
     * Closes this tab's instance without touching the stored data.
     * Used by sibling tabs so the originating tab can drop the database.
     */
    close(): Promise<void>;

    /**
     * Drops the database for every tab on this origin.
     *
     * Broadcasts a session-end event first, because a delete blocks while any tab holds
     * an open connection. Called on login and on logout — login is destructive too, since
     * logout is the path that does not run when a tab is killed.
     */
    destroy(): Promise<void>;

    /**
     * Registers a handler for session-end events raised in another tab.
     *
     * @returns Unsubscribe function.
     */
    onSessionEnd( handler: () => void ): () => void;

    // ===================================================================
    // READS
    // ===================================================================

    /**
     * Observes one record by id. Emits `undefined` while the record is absent, so a
     * caller can distinguish "not loaded yet" from "loaded and empty" via its own scope state.
     *
     * @example
     * dataStore.observeById<Company>( 'company', companyId )
     */
    observeById<T extends Keyed = EntityRecord>( model: string, id: string ): Stream<T | undefined>;

    /**
     * Observes every record matching a clause. Omitting the clause observes the collection.
     *
     * @example
     * dataStore.observeWhere<Partnership>( 'partnership', { companyId } )
     */
    observeWhere<T extends Keyed = EntityRecord>( model: string, where?: Where ): Stream<T[]>;

    /**
     * Reads records by id once, without subscribing.
     *
     * The shredder needs the stored copy to compare `updatedAt` before it writes; a stream
     * would be the wrong shape for a decision taken once per response.
     */
    read<T extends Keyed = EntityRecord>( model: string, ids: readonly string[] ): Promise<T[]>;

    /**
     * Reads every record matching a clause, once, without subscribing.
     *
     * The sibling of `read` for callers deciding something rather than rendering it — the
     * shape of a one-off question, where a stream would leave a subscription to tear down.
     */
    readWhere<T extends Keyed = EntityRecord>( model: string, where?: Where ): Promise<T[]>;

    // ===================================================================
    // WRITES
    // ===================================================================

    /** Replaces the stored record of the same id, or inserts it. */
    write( model: string, records: readonly EntityRecord[] ): Promise<void>;

    /** Removes records by id. Absent ids are ignored. */
    remove( model: string, ids: readonly string[] ): Promise<void>;

    /**
     * Removes every record of one model, leaving the table itself and every other model
     * untouched.
     *
     * @param model - Collection to empty.
     */
    clear( model: string ): Promise<void>;
}
