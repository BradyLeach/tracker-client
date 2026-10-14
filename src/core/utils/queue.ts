/**
 * Generic Queue
 *
 * Minimal keyed FIFO storage. Queue entries retain their insertion order and
 * may be read or updated by key without changing that order.
 *
 * Contains no processing, retry, batching, or domain-specific behaviour.
 */

export class Queue<K, T>
{
    private readonly entries = new Map<K, T>();

    /**
     * Adds or updates an entry.
     *
     * Updating an existing key does not change its position in the queue.
     *
     * @param key - Key identifying the queue entry.
     * @param value - Value to store.
     */
    push( key: K, value: T ): void
    {
        this.entries.set( key, value );
    }

    /**
     * Returns an entry by key without removing it.
     *
     * @param key - Key identifying the queue entry.
     * @returns The stored value, or undefined when the key is not present.
     */
    get( key: K ): T | undefined
    {
        return this.entries.get( key );
    }

    /**
     * Returns whether an entry exists.
     *
     * @param key - Key identifying the queue entry.
     * @returns True when the key exists.
     */
    has( key: K ): boolean
    {
        return this.entries.has( key );
    }

    /**
     * Returns the oldest entry without removing it.
     *
     * @returns The oldest key and value, or undefined when the queue is empty.
     */
    first(): [K, T] | undefined
    {
        return this.entries.entries().next().value;
    }

    /**
     * Removes and returns an entry.
     *
     * @param key - Key identifying the queue entry.
     * @returns The removed value, or undefined when the key is not present.
     */
    pop( key: K ): T | undefined
    {
        const value = this.entries.get( key );

        if( value !== undefined )
        {
            this.entries.delete( key );
        }

        return value;
    }

    /**
     * Returns the number of queued entries.
     *
     * @returns Number of entries currently held.
     */
    size(): number
    {
        return this.entries.size;
    }

    /**
     * Removes all queued entries.
     */
    clear(): void
    {
        this.entries.clear();
    }
}