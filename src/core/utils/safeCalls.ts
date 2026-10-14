/**
 * safeAsync.ts
 *
 * Generic try/catch wrapper for any async function.
 * Returns a tuple of [result, error], allowing destructured, inline error handling.
 */
import type { ApiResponse, ApiError } from '@/services/dataService/dataService.types';
import { logger } from '@/core/utils/logger';

type SafeAsyncResult<T> = {
    result: T | undefined;
    error: Error | undefined;
};

const genericError: ApiError = {
    key: "error.unknown"
};

/**
 * Wrap any async function call and return [result, error].
 *
 * @template T The type of the resolved value
 * @param fn A function that returns a Promise<T>
 * @returns A Promise resolving to SafeAsyncResult<T>
 *
 * @example
 * const { result, error } = await safeAsync(() => someAsyncCall());
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    onFinally?: () => void
): Promise<SafeAsyncResult<T>>
{
    try
    {
        const result = await fn();
        return { result, error: undefined };
    }
    catch ( err )
    {
        const error = err instanceof Error ? err : new Error( String( err ) );
        logger.error( error );
        return { result: undefined, error };
    }
    finally
    {
        if( onFinally ) onFinally();
    }
}

/**
 * safeApiResponse
 *
 * Wraps HTTP client calls to catch transport/network errors.
 * Enriches ApiResponse with HTTP status code from transport layer.
 * Only catches real exceptions - never alters 4xx/5xx responses.
 *
 * @template T The expected data type inside ApiResponse<T>
 * @param fn A function returning an HTTP response with ApiResponse in data field
 * @param finallyCallback Optional callback to run after completion
 * @returns A Promise<ApiResponse<T>> with status field populated
 *
 * @example
 * const response = await safeApiResponse(
 *   () => api.get('/example'),
 *   () => setLoading(false)
 * );
 * if (response.error) { ... }
 * if (response.status === 404) { ... }
 */
export async function safeApiResponse<T>(
    fn: () => Promise<{ data: ApiResponse<T>; status: number }>,
    finallyCallback?: () => void
): Promise<ApiResponse<T>>
{
    try
    {
        const response = await fn();
        return {
            ...response.data,
            status: response.status
        };
    }
    catch ( err )
    {
        logger.error( 'Transport-level API error', { error: err } );
        return {
            error: genericError,
            status: 500
        };
    }
    finally
    {
        if( finallyCallback ) finallyCallback();
    }
}