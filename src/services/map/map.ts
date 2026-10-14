/**
 * Map Service - Public API
 *
 * What the application uses. The implementation is swappable: change the
 * import below to move off Leaflet without touching a single call site.
 *
 * Mirrors the DataService pattern — app code imports from here, the
 * implementation is configuration rather than a dependency.
 */

import { LeafletMapView } from './map.leaflet';
import type { MapViewProps } from './map.types';

/** Active map renderer. */
export const mapRenderer: ( props: MapViewProps ) => React.ReactElement | null = LeafletMapView;

export type { MapPin, MapCoordinates, MapViewProps } from './map.types';
