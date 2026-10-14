/**
 * Realtime Service - Socket.IO Adapter
 *
 * The only module in the application that imports `socket.io-client`. Enforced by
 * `no-restricted-imports` in eslint.config.js, mirroring `dataStore.dexie.ts`.
 *
 * Connects to the same origin the REST API is served from — Socket.IO is attached
 * to the same `http.createServer` instance on the default namespace/path, not a
 * separate service, so no new config key is needed beyond `apiConfig.baseUrl`.
 */

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getConfig } from '@/config';
import { logger } from '@/core/utils/logger';
import { tokenStore } from '@/services/http/tokenStore';
import type { DirtyBatch, RealtimeAdapter, RecoverResult } from './realtime.types';

const DIRTY_EVENT = 'dirty';
const RECOVER_EVENT = 'recover';
const ACK_EVENT = 'ack';

/**
 * The origin Socket.IO listens on. `apiConfig.baseUrl` carries the REST path
 * prefix (`/api/v1`), which Socket.IO would otherwise interpret as a namespace —
 * only the origin is wanted.
 */
function origin(): string
{
    const url = new URL( getConfig().apiConfig.baseUrl ).origin;

    logger.debug( `Realtime → origin: ${url}` );

    return url;
}

let socket: Socket | undefined;
const dirtyHandlers = new Set<( batches: DirtyBatch[] ) => void>();
const reconnectHandlers = new Set<() => void>();

export const socketIoRealtime: RealtimeAdapter = {

    connect(): void
    {
        if( socket ) return;

        const url = origin();

        socket = io( url, {
            auth: ( callback ) => callback( { token: tokenStore.get() } )
        } );;

        socket.on( 'connect', () =>
        {
            logger.debug( 'Realtime → connected' );
            reconnectHandlers.forEach( handler => handler() );
        } );

        socket.on( 'connect_error', ( error ) =>
        {
            logger.warn( 'Realtime → connect error', { message: error.message } );
        } );

        socket.on( 'disconnect', ( reason ) =>
        {
            logger.debug( 'Realtime → disconnected', { reason } );
        } );

        socket.on( DIRTY_EVENT, ( batches: DirtyBatch[] ) =>
        {
            dirtyHandlers.forEach( handler => handler( batches ) );
        } );
    },

    disconnect(): void
    {
        socket?.disconnect();
        socket = undefined;
    },

    onDirty( handler: ( batches: DirtyBatch[] ) => void ): () => void
    {
        dirtyHandlers.add( handler );
        return () => dirtyHandlers.delete( handler );
    },

    onReconnect( handler: () => void ): () => void
    {
        reconnectHandlers.add( handler );
        return () => reconnectHandlers.delete( handler );
    },

    recover(): Promise<RecoverResult>
    {
        return new Promise( ( resolve, reject ) =>
        {
            if( !socket )
            {
                reject( new Error( 'Realtime: recover() called before connect()' ) );
                return;
            }

            socket.emit( RECOVER_EVENT, undefined, ( result: RecoverResult ) => resolve( result ) );
        } );
    },

    ack( batches: DirtyBatch[] ): void
    {
        if( !socket?.connected )
        {
            // Not fatal: an unacked ledger entry simply stays pending and is
            // redelivered on the next recover() — at-least-once, not lost.
            logger.warn( 'Realtime → ack skipped, socket not connected' );
            return;
        }

        socket.emit( ACK_EVENT, batches );
    }
};
