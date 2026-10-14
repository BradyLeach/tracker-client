/**
 * Test factories for bootstrap loader objects
 *
 * Creates mock bootstrap loaders with configurable behavior for testing
 * the BootstrapOrchestrator. Supports delays, errors, and critical/non-critical modes.
 */

import type { BootstrapLoader } from '@/core/bootstrap/types';

/**
 * Creates a bootstrap loader with configurable options
 *
 * @param name - Loader identifier (used as key in results)
 * @param options - Configuration options
 * @param options.critical - Whether loader is critical (blocks app startup if fails)
 * @param options.data - Data to return on successful load
 * @param options.error - Error to throw (can be Error, string, or any value)
 * @param options.delay - Delay in milliseconds before load completes
 */
export const makeLoader = <T = unknown>(
    name: string,
    { critical, data, error, delay = 0 }: {
        critical: boolean;
        data: T;
        error?: unknown;
        delay?: number;
    }
): BootstrapLoader<T> =>
{
    return {
        name,
        critical,
        async load(): Promise<T>
        {
            if( delay > 0 )
            {
                await new Promise( resolve => setTimeout( resolve, delay ) );
            }

            if( error )
            {
                throw error instanceof Error ? error : new Error( String( error ) );
            }

            return data;
        }
    } satisfies BootstrapLoader<T>;
};

/**
 * Creates a critical bootstrap loader (blocks app startup if fails)
 *
 * @param name - Loader identifier
 * @param data - Data to return on successful load
 * @param delay - Optional delay in milliseconds
 * @param error - Optional error to throw
 */
export const makeCriticalLoader = <T = unknown>(
    name: string,
    data: T,
    delay: number = 0,
    error?: unknown
): BootstrapLoader<T> => makeLoader( name, { critical: true, data, error, delay } );

/**
 * Creates a non-critical bootstrap loader (app continues if fails)
 *
 * @param name - Loader identifier
 * @param data - Data to return on successful load
 * @param delay - Optional delay in milliseconds
 * @param error - Optional error to throw
 */
export const makeNonCriticalLoader = <T = unknown>(
    name: string,
    data: T,
    delay: number = 0,
    error?: unknown
): BootstrapLoader<T> => makeLoader( name, { critical: false, data, error, delay } );