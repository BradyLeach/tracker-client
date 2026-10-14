/**
 * Raw Axios client with global interceptors.
 *
 * - Never throws on 4xx/5xx (validateStatus = always true)
 * - Logs all requests and responses
 * - Only throws for network/transport-level failures
 *
 * @example
 * const response = await api.get('/endpoint');
 * if (response.status === 404) { ... }
 */

import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logger } from '@/core/utils/logger';
import { getConfig } from '@/config';
import { tokenStore } from './tokenStore';

declare module 'axios' {
    interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

const { apiConfig } = getConfig();

const api = axios.create( {
    baseURL: apiConfig.baseUrl,
    withCredentials: true,
    validateStatus: () => true // Don't throw on 4xx/5xx
} );

// Log requests
api.interceptors.request.use(
    ( config ) =>
    {
        logger.debug( 'API → Request', {
            method: config.method?.toUpperCase(),
            baseURL: config.baseURL,
            path: config.url,
            fullUrl: `${config.baseURL ?? ''}${config.url ?? ''}`
        } );
        return config;
    },
    ( error ) =>
    {
        logger.error( 'API → Request error', { message: error.message } );
        return Promise.reject( error );
    }
);

// Log responses
api.interceptors.response.use(
    ( response ) =>
    {
        logger.debug( 'API → Response', {
            status: response.status,
            url: response.config.url,
            method: response.config.method?.toUpperCase()
        } );
        return response;
    },
    ( error ) =>
    {
        logger.error( 'API → Response error', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        } );
        return Promise.reject( error );
    }
);

const AUTH_HEADER = 'x-auth-token';

// Inject access token on outgoing requests
api.interceptors.request.use(
    ( config ) =>
    {
        const token = tokenStore.get();
        if( token )
        {
            config.headers[AUTH_HEADER] = token;
        }
        return config;
    }
);

// Capture access token from responses
api.interceptors.response.use(
    ( response ) =>
    {
        const token = response.headers[AUTH_HEADER];
        if( token )
        {
            tokenStore.set( token );
        }
        return response;
    }
);

// 401 refresh interceptor — transparently refresh expired tokens
const REFRESH_PATH = '/auth/refresh';

let isRefreshing = false;
let refreshPromise: Promise<AxiosResponse> | null = null;
let refreshQueue: { resolve: ( value: AxiosResponse ) => void; reject: ( reason: unknown ) => void; config: InternalAxiosRequestConfig }[] = [];

/**
 * Refresh the access token. If a refresh is already in progress, returns the existing promise.
 * Prevents duplicate refresh calls during bootstrap and post-render hydration.
 */
export function refreshAuth(): Promise<AxiosResponse> 
{
    if( isRefreshing && refreshPromise ) 
    {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = api.post( REFRESH_PATH )
        .then( ( refreshResponse ) => 
        {
            if( refreshResponse.status !== 200 ) 
            {
                tokenStore.clear();
            }
            return refreshResponse;
        } )
        .catch( ( error ) => 
        {
            logger.error( 'refreshAuth: error', { message: error.message } );
            tokenStore.clear();
            throw error;
        } )
        .finally( () => 
        {
            isRefreshing = false;
            refreshPromise = null;
        } );

    return refreshPromise;
}

function drainQueue( success: boolean ): void
{
    const queue = [...refreshQueue];
    refreshQueue = [];

    if( success )
    {
        queue.forEach( ( { resolve, reject, config } ) => api( config ).then( resolve, reject ) );
    }
    else
    {
        queue.forEach( ( { reject } ) => reject( new Error( 'Refresh failed' ) ) );
    }
}

api.interceptors.response.use(
    ( response ) =>
    {
        if( response.status !== 401 ) return response;

        const originalConfig = response.config;

        // Don't intercept the refresh call itself
        if( originalConfig.url === REFRESH_PATH ) return response;

        // Don't retry a request that already retried
        if( originalConfig._retry ) return response;

        originalConfig._retry = true;

        // If a refresh is already in flight, queue this request
        if( isRefreshing )
        {
            return new Promise<AxiosResponse>( ( resolve, reject ) =>
            {
                refreshQueue.push( { resolve, reject, config: originalConfig } );
            } );
        }

        return refreshAuth()
            .then( ( refreshResponse ) =>
            {
                if( refreshResponse.status !== 200 )
                {
                    drainQueue( false );
                    window.location.href = '/auth/login';
                    return response; // Unreachable after redirect, satisfies TS
                }

                // Token already captured by the token-capture interceptor
                drainQueue( true );
                return api( originalConfig );
            } )
            .catch( () =>
            {
                drainQueue( false );
                window.location.href = '/auth/login';
                return response; // Unreachable after redirect, satisfies TS
            } );
    }
);

export default api;
