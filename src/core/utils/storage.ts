/**
 * Preference Storage Utility
 *
 * Handles client-side persistence of user preferences.
 * Guarded against SSR environments and JSON serialization errors.
 * Safari private mode safe - every operation has error guards.
 *
 * Keys are namespaced with 'trk:' prefix to avoid collisions.
 */

/**
 * Check if localStorage is available (SSR guard + quota check)
 */
function checkStorageAvailable(): boolean
{
    try
    {
        const test = '__ss_test__';
        localStorage.setItem( test, test );
        localStorage.removeItem( test );
        return true;
    }
    catch
    {
        return false;
    }
}

// Cache storage availability on module load
const storageAvailable = typeof window !== 'undefined' && checkStorageAvailable();

/**
 * Storage operations with SSR guards and error handling
 */
export const preferenceStorage = {
    /**
     * Get a stored preference, with fallback to default
     */
    get<T>( key: string, defaultValue: T ): T
    {
        if( !storageAvailable ) return defaultValue;

        try
        {
            const item = localStorage.getItem( `trk:${key}` );
            return item ? JSON.parse( item ) : defaultValue;
        }
        catch ( error )
        {
            console.warn( `[Storage] Failed to read ${key}:`, error );
            return defaultValue;
        }
    },

    /**
     * Set a stored preference
     */
    set<T>( key: string, value: T ): void
    {
        if( !storageAvailable ) return;

        try
        {
            localStorage.setItem( `trk:${key}`, JSON.stringify( value ) );
        }
        catch ( error )
        {
            console.warn( `[Storage] Failed to persist ${key}:`, error );
        }
    },

    /**
     * Check if a key exists in storage
     * (Safari private mode safe - wrapped in try/catch)
     */
    has( key: string ): boolean
    {
        if( !storageAvailable ) return false;

        try
        {
            return localStorage.getItem( `trk:${key}` ) !== null;
        }
        catch
        {
            return false;
        }
    },

    /**
     * Remove a stored preference
     */
    remove( key: string ): void
    {
        if( !storageAvailable ) return;

        try
        {
            localStorage.removeItem( `trk:${key}` );
        }
        catch ( error )
        {
            console.warn( `[Storage] Failed to remove ${key}:`, error );
        }
    },
} as const;
