/**
 * Plain HTTP Implementation of DataService - No caching, no query keys, no invalidation
 *
 * The `DataService` contract as written: issue the request, unwrap the envelope, hand back
 * the result. Nothing here remembers a previous call or coordinates with another one.
 *
 * This is what "DataService performs no caching" (design doc §2.1) commits to, and it is the
 * active implementation behind `dataService`. Persisted entity state belongs to the domain
 * stores; everything else — pre-auth reads, bootstrap loads, trash views — reads the server
 * fresh through the same `DataService` interface. No caller decides "should this call bypass
 * caching"; the implementation it is wired to simply never had any.
 *
 * Layer architecture:
 * config → buildApiQuery → api.ts (HTTP) → apiService.ts (HTTP) → dataService.http.ts (this) → Domain Services
 */
import { apiService } from '@/services/http/api.service';

import type {
    DataService,
    QueryOptions,
    ApiResponse,
    ApiResponseMeta,
    ResourceIdOrQuery
} from './dataService.types';

class HttpDataService implements DataService
{
    async create<T>( service: string, data: unknown, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.post<T>( service, data );
    }

    async getAll<T>( service: string, query?: Record<string, unknown>, options?: QueryOptions ): Promise<ApiResponse<T[]>>
    {
        // `includes` on QueryOptions is honoured here the same way getOne already honours it —
        // one contract, one rule for where `includes` may travel, not two depending on method.
        const mergedQuery = options?.includes ? { ...query, includes: options.includes } : query;

        return apiService.get<T[]>( service, mergedQuery );
    }

    async getOne<T>( service: string, idOrQuery: ResourceIdOrQuery, options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        const path = typeof idOrQuery === 'string' ? `${service}/${idOrQuery}` : service;
        const baseQuery = typeof idOrQuery === 'string' ? undefined : idOrQuery;
        const query = options?.includes ? { ...baseQuery, includes: options.includes } : baseQuery;

        return apiService.get<T>( path, query );
    }

    async getMetadata( service: string, query?: Record<string, unknown>, _options?: QueryOptions ): Promise<ApiResponseMeta>
    {
        const response = await apiService.get<void>( `${service}/metadata`, query );

        // The interface returns a bare ApiResponseMeta with no error channel, so a failed
        // request has nowhere honest to put `error` — throwing is what stops a caller reading
        // `.total` off a value that was never really there.
        if( response.error ) throw response.error;

        return response.meta!;
    }

    async update<T>( service: string, id: string, data: unknown, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.patch<T>( `${service}/${id}`, data );
    }

    async patch<T>( service: string, data: unknown, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.patch<T>( service, data );
    }

    async remove<T = void>( service: string, id: string, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.delete<T>( `${service}/${id}` );
    }

    async query<T>( service: string, query: Record<string, unknown>, _options?: QueryOptions ): Promise<ApiResponse<T[]>>
    {
        return apiService.post<T[]>( `${service}/query`, query );
    }

    async post<T>( path: string, data?: unknown, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.post<T>( path, data );
    }

    async get<T>( path: string, query?: Record<string, unknown>, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.get<T>( path, query );
    }

    async delete<T = void>( path: string, data?: unknown, query?: Record<string, unknown>, _options?: QueryOptions ): Promise<ApiResponse<T>>
    {
        return apiService.delete<T>( path, data, query );
    }
}

export const httpDataService = new HttpDataService();
