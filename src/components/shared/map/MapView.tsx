/**
 * MapView
 *
 * The app's map. Renders pins and nothing else — it knows no map library, so
 * app code never imports one.
 *
 * @example
 * ```tsx
 * <MapView
 *     pins={addresses.map( toPin )}
 *     height={280}
 *     emptyState={<Typography variant="body2">No mapped addresses</Typography>}
 * />
 * ```
 */

import { mapRenderer } from '@/services/map/map';
import type { MapViewProps } from '@/services/map/map';

export function MapView( props: MapViewProps )
{
    return mapRenderer( props );
}

export default MapView;
