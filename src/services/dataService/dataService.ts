/**
 * DataService - Public API
 *
 * This is what the application uses. The implementation is swappable.
 *
 * Pattern mirrors backend's adapter system:
 * - App code imports from here
 * - Implementation is configuration, not dependency
 */
import type { DataService } from './dataService.types';
import { httpDataService } from './dataService.http';

/**
 * Active DataService Implementation
 *
 * Plain, uncached HTTP. Persisted entity state belongs to the domain stores; everything
 * that reads through here reads the server as it is right now.
 */
export const dataService: DataService = httpDataService;

/**
 * The plain, uncached implementation of the `DataService` contract — no query keys, no
 * invalidation, nothing remembered between calls. The domain stores reach the server
 * through it directly.
 */
export { httpDataService } from './dataService.http';

// Re-export types for convenience
export type { DataService, QueryOptions, ApiResponseMeta } from './dataService.types';
