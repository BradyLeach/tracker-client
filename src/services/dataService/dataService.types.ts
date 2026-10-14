/**
 * DataService Types
 *
 * Type definitions for the data service abstraction layer.
 * Defines DSL for query options and service interface.
 */

/**
 * Query DSL - per-request options
 *
 * Similar to backend's Query DSL, this provides a consistent
 * interface regardless of the transport underneath.
 */
export interface QueryOptions
{
    /** Related resources to include in the response (e.g. ['company', 'currentState']). */
    includes?: string[];
}

/**
 * ID or query object used to fetch a single resource.
 * - String: treated as ID (e.g. /profile/:id)
 * - Object: treated as query (e.g. { name: 'joe blogs' })
 */
export type ResourceIdOrQuery = string | Record<string, unknown>;

/**
 * Metadata response structure
 *
 * Standard shape returned by metadata endpoints
 */
export interface ApiResponseMeta
{
    /** Total count of resources */
    total: number;

    /** Current page (if paginated) */
    page?: number;

    /** Items per page (if paginated) */
    limit?: number;

    /** Total pages (if paginated) */
    totalPages?: number;

    /** Offset index used (alternative to page), if applicable. */
    offset?: number;

    /** The number of results returned */
    returned?: number;

    /** True when additional pages are available (true if not the last page). */
    hasMore?: boolean;
}

/**
 * ApiError
 *
 * Structured error object returned by all failed API responses.
 * Designed to be machine-readable and support localized display.
 */
export interface ApiError
{
    /** A short machine-readable error key (e.g., 'resource.invalid') */
    key: string;

    /** Optional structured details (e.g., invalid field, constraint, or value) */
    details?: Record<string, unknown>;
}

/**
 * ApiResponse<T>
 *
 * Standardized API response structure returned by all backend endpoints.
 * This shape mirrors the backend contract and supports both data and metadata.
 * Use this type to strongly type API responses throughout the frontend and backend.
 *
 * @template T - The expected type of the `data` payload (e.g., a model, array, or void).
 */
export interface ApiResponse<T = unknown>
{
    /**
     * The main data payload returned by the API.
     * - For list endpoints: typically an array of resources.
     * - For detail endpoints: a single resource.
     * - For metadata-only responses: undefined.
     * - For error responses: undefined.
     */
    data?: T;

    /**
     * Optional metadata object containing pagination, counts, and context.
     * Present on all list and metadata endpoints (and some detail responses).
     */
    meta?: ApiResponseMeta;

    /**
     * Optional error object returned when a failure occurs.
     *
     * @example
     * // Success response
     * {
     *   data: { id: '123', name: 'Test' },
     *   meta: { total: 1 },
     *   status: 200
     * }
     *
     * @example
     * // Error response
     * {
     *   error: {
     *     key: 'resource.noexist',
     *     details: { field: 'clientIp' }
     *   },
     *   status: 404
     * }
     */
    error?: ApiError;

    /**
     * HTTP status code of the response.
     * Sourced from the transport layer (axios response headers).
     *
     * @example
     * { data: {...}, status: 201 }
     * { error: {...}, status: 404 }
     */
    status?: number;
}

/**
 * DataService Interface
 *
 * Abstract interface for data fetching operations.
 * Implementation details (the HTTP transport) are hidden behind this contract.
 *
 * Pattern mirrors backend crudRouteFactory.js:
 * - Semantic CRUD methods for standard resource operations
 * - Generic HTTP methods for RPC-style operations
 */
export interface DataService
{
    // ===================================================================
    // STANDARD CRUD OPERATIONS (99% of use cases)
    // Maps directly to backend crudRouteFactory.js patterns
    // ===================================================================

    /**
     * POST / - Create a new resource
     * Backend: router.post('/', ...) → service.create()
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param data - Payload to send to the API
     * @param options - Optional mutation config
     * @returns A promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.create('profiles', { name: 'John' });
     * // POST /api/v1/profiles
     */
    create<T>( service: string, data: unknown, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * GET / - Get all resources with filtering
     * Backend: router.get('/', ...) → service.findAll()
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param query - Optional query filter (e.g., { where, includes, etc. })
     * @param options - Optional query config
     * @returns A promise resolving to ApiResponse<T[]>
     *
     * @example
     * await dataService.getAll('profiles', { where: { active: true } });
     * // GET /api/v1/profiles?where[active]=true
     */
    getAll<T>( service: string, query?: Record<string, unknown>, options?: QueryOptions ): Promise<ApiResponse<T[]>>;

    /**
     * GET /:id - Get a specific resource by ID
     * Backend: router.get('/:id', ...) → service.findById()
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param idOrQuery - ID string or query object (e.g., { slug: 'brady' })
     * @param options - Optional query config (includes)
     * @returns A promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.getOne('profiles', '123');
     * // GET /api/v1/profiles/123
     */
    getOne<T>( service: string, idOrQuery: ResourceIdOrQuery, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * GET /metadata - Get permission-filtered metadata
     * Backend: router.get('/metadata', ...) → service.metadata()
     *
     * @param service - Service name (e.g., 'profiles')
     * @param query - Optional query filters (e.g., { where })
     * @param options - Query options (includes)
     * @returns Promise resolving to metadata
     *
     * @example
     * const meta = await dataService.getMetadata('profiles', { where: { active: true } });
     * // GET /api/v1/profiles/metadata?where[active]=true
     */
    getMetadata( service: string, query?: Record<string, unknown>, options?: QueryOptions ): Promise<ApiResponseMeta>;

    /**
     * PATCH /:id - Update an existing resource
     * Backend: router.patch('/:id', ...) → service.update()
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param id - ID of the resource to update
     * @param data - Payload to update
     * @param options - Optional mutation config
     * @returns A promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.update('profiles', '123', { name: 'Jane' });
     * // PATCH /api/v1/profiles/123
     */
    update<T>( service: string, id: string, data: unknown, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * PATCH / - Update a resource without an ID in path
     * Backend: router.patch('/', ...) → service.update()
     * Used for singleton resources or non-RESTful updates (e.g., preferences)
     *
     * @param service - Resource path (e.g., 'preference/app')
     * @param data - Payload to update
     * @param options - Optional mutation config
     * @returns A promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.patch('preference/app', { languageId: '123' });
     * // PATCH /api/v1/preference/app
     */
    patch<T>( service: string, data: unknown, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * DELETE /:id - Soft/hard delete a resource
     * Backend: router.delete('/:id', ...) → service.delete()
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param id - ID of the resource to delete
     * @param options - Optional mutation config
     * @returns A promise resolving to ApiResponse<void>
     *
     * @example
     * await dataService.remove('profiles', '123');
     * // DELETE /api/v1/profiles/123
     */
    remove<T = void>( service: string, id: string, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * POST /query - Advanced query with request body
     * Backend: router.post('/query', ...) → service.findAll()
     * Use when query params would be too complex for GET
     *
     * @param service - Resource name (e.g., 'profiles')
     * @param query - Query object to send in request body
     * @param options - Query options (includes)
     * @returns Promise resolving to ApiResponse<T[]>
     *
     * @example
     * await dataService.query('profiles', { where: { complex: 'filters' }, includes: ['groups'] });
     * // POST /api/v1/profiles/query
     */
    query<T>( service: string, query: Record<string, unknown>, options?: QueryOptions ): Promise<ApiResponse<T[]>>;

    // ===================================================================
    // RPC-STYLE OPERATIONS (1% edge cases)
    // For operations that don't follow resource semantics
    // ===================================================================

    /**
     * Generic POST for RPC-style operations (verification, login, restore, etc.)
     * Backend examples:
     *   - POST /registration/verify
     *   - POST /auth/login
     *   - POST /:id/restore
     *   - POST /:id/associations/:associationType
     *
     * These are actions, not resource fetches
     *
     * @param path - Full path (e.g., 'registration/verify', 'auth/login')
     * @param data - Optional payload
     * @param options - Optional mutation config
     * @returns Promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.post('registration/verify', { code: '123456' });
     * // POST /api/v1/registration/verify
     */
    post<T>( path: string, data?: unknown, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * Generic GET for non-standard endpoints
     * Backend example: GET /definition
     *
     * @param path - Full path (e.g., 'profiles/definition')
     * @param query - Optional query parameters
     * @param options - Optional query config
     * @returns Promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.get('profiles/definition');
     * // GET /api/v1/profiles/definition
     */
    get<T>( path: string, query?: Record<string, unknown>, options?: QueryOptions ): Promise<ApiResponse<T>>;

    /**
     * Generic DELETE for non-standard endpoints
     * Backend example: DELETE /:id/associations/:associationType
     *
     * @param path - Full path
     * @param data - Optional payload
     * @param query - Optional query parameters (e.g., { hard: true } for a permanent delete)
     * @param options - Optional mutation config
     * @returns Promise resolving to ApiResponse<T>
     *
     * @example
     * await dataService.delete('profiles/123/associations/groups', { ids: ['456'] });
     * // DELETE /api/v1/profiles/123/associations/groups
     *
     * @example
     * await dataService.delete('business/companies/123', undefined, { hard: true });
     * // DELETE /api/v1/business/companies/123?hard=true
     */
    delete<T = void>(
        path: string,
        data?: unknown,
        query?: Record<string, unknown>,
        options?: QueryOptions
    ): Promise<ApiResponse<T>>;
}
