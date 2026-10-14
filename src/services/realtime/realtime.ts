/**
 * Realtime Service - Public API
 *
 * What the application uses. The implementation is swappable: change the import
 * below to move off Socket.IO without touching a call site. Mirrors the
 * DataStore/Map pattern — app code imports from here, the implementation is
 * configuration rather than a dependency.
 */

import { socketIoRealtime } from './realtime.socketio';
import type { RealtimeAdapter } from './realtime.types';

/** Active realtime transport. */
export const realtimeService: RealtimeAdapter = socketIoRealtime;

export type { DirtyBatch, DirtyRecord, RealtimeAdapter, RecoverResult } from './realtime.types';
