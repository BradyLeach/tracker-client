/**
 * DataStore - Public API
 *
 * This is what the application uses. The implementation is swappable.
 * Change the storage engine by swapping one import.
 *
 * Pattern mirrors the DataService:
 * - App code imports from here
 * - Implementation is configuration, not dependency
 *
 * DataStore implementation details must not be exposed outside this module. No engine
 * object is re-exported — an import lint cannot catch a re-export, so the port must not
 * expose the engine's own objects: no database handle, no table handle, no query object.
 */
import type { DataStore } from './dataStore.types';
import { dexieDataStore } from './dataStore.dexie';

// Re-exported because scope is stored through the port like any other record.
export { SCOPE_TABLE } from './dataStore.dexie';

/**
 * Active DataStore Implementation
 *
 * Currently using the Dexie implementation.
 */
export const dataStore: DataStore = dexieDataStore;

// Re-export types for convenience
export type {
    DataStore,
    EntityRecord,
    Stream,
    Where,
    WhereComparison,
    WhereScalar,
    ActorIdentity
} from './dataStore.types';
