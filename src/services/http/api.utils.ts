import type { ApiQuery } from '../types';

/**
 * Builds a relative API path for a given service and ID or query.
 *
 * Returns paths WITHOUT baseURL - Axios client manages baseURL.
 * This keeps path construction separate from deployment concerns.
 *
 * @param service - The resource name (e.g. 'profile', 'account/registration')
 * @param idOrQuery - A string ID or a query object
 * @returns Relative path and optional query params
 *
 * @example
 * buildApiQuery('profile', 'abc123') // { url: '/profile/abc123', params: undefined }
 * buildApiQuery('profile', { slug: 'brady' }) // { url: '/profile', params: { slug: 'brady' } }
 * buildApiQuery('account/registration', {}) // { url: '/account/registration', params: undefined }
 */
export function buildApiQuery(
    service: string,
    idOrQuery: string | Record<string, unknown>
): ApiQuery
{
    let url = `/${service}`;
    let params: Record<string, unknown> | undefined;

    // If it is a string, we need to add it to the url, otherwise we need to
    // process the object params.
    if( typeof idOrQuery === 'string' )
    {
        url += `/${encodeURIComponent( idOrQuery )}`;
    }
    else
    {
        params = idOrQuery;
    }

    return { url, params };
}