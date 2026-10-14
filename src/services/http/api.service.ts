/**
 * apiService - Layer 2: Generic HTTP adapter (HTTP verb layer)
 *
 * Pure HTTP operations with no semantic meaning.
 * This layer knows NOTHING about resources, CRUD, or business operations.
 * It just executes HTTP verbs and returns ApiResponse<T>.
 *
 * Responsibilities:
 * - Execute HTTP methods (GET, POST, PATCH, PUT, DELETE)
 * - Use buildApiQuery for ALL URL construction (centralized via config)
 * - Return ApiResponse<T> contract
 * - NO caching, NO retries, NO business logic, NO semantics
 *
 * Layer architecture:
 * config → buildApiQuery → api.ts (Axios) → apiService.ts (HTTP) → dataService.ts (Semantics + Cache) → Domain Services
 *
 * @example
 * const response = await apiService.get<User>('profiles/123');
 * const response = await apiService.post<User>('profiles', { name: 'John' });
 */

import api from './api';
import { safeApiResponse } from '@/core/utils';
import { buildApiQuery } from './api.utils';
import type { ApiResponse } from '../dataService/dataService.types';

export const apiService = {

    /**
     * HTTP GET - Retrieve data
     *
     * @template T - The expected response data type
     * @param path - Full path or resource name (e.g., "profiles", "profiles/123", "profiles/metadata")
     * @param query - Optional query parameters (e.g., { where: {...}, includes: [...] })
     * @returns A promise that resolves with ApiResponse<T>
     *
     * @example
     * await apiService.get('profiles');              // GET /api/v1/profiles
     * await apiService.get('profiles/123');          // GET /api/v1/profiles/123
     * await apiService.get('profiles', { where: { active: true } }); // GET /api/v1/profiles?where[active]=true
     */
    get<T>( path: string, query?: Record<string, unknown> ): Promise<ApiResponse<T>>
    {
        const { url, params } = buildApiQuery( path, query ?? {} );
        return safeApiResponse<T>( () => api.get( url, { params } ) );
    },

    /**
     * HTTP POST - Send data (create, actions, RPC operations)
     *
     * @template T - The expected response data type
     * @param path - Full path (e.g., "profiles", "auth/login", "profiles/123/restore")
     * @param data - Optional payload to send
     * @returns A promise that resolves with ApiResponse<T>
     *
     * @example
     * await apiService.post('profiles', { name: 'John' });       // POST /api/v1/profiles
     * await apiService.post('auth/login', { email, password });  // POST /api/v1/auth/login
     * await apiService.post('profiles/query', { where: {...} }); // POST /api/v1/profiles/query
     */
    post<T>( path: string, data?: unknown ): Promise<ApiResponse<T>>
    {
        const { url } = buildApiQuery( path, {} );
        return safeApiResponse<T>( () => api.post( url, data ) );
    },

    /**
     * HTTP PATCH - Partial update
     *
     * @template T - The expected response data type
     * @param path - Full path (e.g., "profiles/123")
     * @param data - Partial payload to update
     * @returns A promise that resolves with ApiResponse<T>
     *
     * @example
     * await apiService.patch('profiles/123', { name: 'Jane' }); // PATCH /api/v1/profiles/123
     */
    patch<T>( path: string, data: unknown ): Promise<ApiResponse<T>>
    {
        const { url } = buildApiQuery( path, {} );
        return safeApiResponse<T>( () => api.patch( url, data ) );
    },

    /**
     * HTTP PUT - Full replacement (optional - rarely used)
     *
     * @template T - The expected response data type
     * @param path - Full path (e.g., "profiles/123")
     * @param data - Complete payload to replace
     * @returns A promise that resolves with ApiResponse<T>
     *
     * @example
     * await apiService.put('profiles/123', fullProfile); // PUT /api/v1/profiles/123
     */
    put<T>( path: string, data: unknown ): Promise<ApiResponse<T>>
    {
        const { url } = buildApiQuery( path, {} );
        return safeApiResponse<T>( () => api.put( url, data ) );
    },

    /**
     * HTTP DELETE - Remove data
     *
     * @template T - The expected response data type
     * @param path - Full path (e.g., "profiles/123", "profiles/123/associations/groups")
     * @param data - Optional payload (for delete with body, e.g., bulk deletes)
     * @param query - Optional query parameters (e.g., { hard: true })
     * @returns A promise that resolves with ApiResponse<T>
     *
     * @example
     * await apiService.delete('profiles/123');                        // DELETE /api/v1/profiles/123
     * await apiService.delete('profiles', { ids: ['1', '2'] });       // DELETE /api/v1/profiles (bulk)
     * await apiService.delete('profiles/123/associations/groups');    // DELETE /api/v1/profiles/123/associations/groups
     * await apiService.delete('profiles/123', undefined, { hard: true }); // DELETE /api/v1/profiles/123?hard=true
     */
    delete<T = void>( path: string, data?: unknown, query?: Record<string, unknown> ): Promise<ApiResponse<T>>
    {
        const { url, params } = buildApiQuery( path, query ?? {} );
        return safeApiResponse<T>( () => api.delete( url, { data, params } ) );
    }
};
