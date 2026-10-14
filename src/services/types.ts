/**
 * ApiQuery
 *
 * Represents a resolved API request shape for a given service and ID or query.
 * Used by adapter-layer clients (e.g. Axios) to standardize input format.
 */
export interface ApiQuery
{
    /** Full request URL (including base path and ID if provided) */
    url: string;

    /** Optional query params, present if `idOrQuery` was an object */
    params?: Record<string, unknown>;
}