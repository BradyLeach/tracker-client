/**
 * MapView Playground
 *
 * The map is library-agnostic to app code: this file imports no Leaflet, only
 * `MapView` and a `MapPin[]`. Swapping the renderer in `@/services/map` should
 * leave this tab unchanged.
 *
 * Covers what a real record produces: several pins, one pin, none, and the
 * narrow width the detail panel gives.
 */

import { useState } from 'react';
import { Box, Stack, Typography, Divider } from '@/components/ui';
import { MapView } from '@/components/shared/map';
import type { MapPin } from '@/components/shared/map';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// `kind` is opaque to the renderer — it only decides which of two pin colours
// to use, so the domain keeps the meaning.

const PINS: MapPin[] = [
    { id: 'a1', lat: -31.9523, lng: 115.8613, label: 'Perth Warehouse', description: '12 Kewdale Rd, Perth WA', kind: 'location' },
    { id: 'a2', lat: -33.8688, lng: 151.2093, label: 'Sydney Head Office', description: '1 Market St, Sydney NSW', kind: 'address' },
    { id: 'a3', lat: -37.8136, lng: 144.9631, label: 'Melbourne Depot', description: '400 Docklands Dr, Melbourne VIC', kind: 'location' },
    { id: 'a4', lat: -27.4698, lng: 153.0251, label: 'Brisbane Billing', description: '55 Ann St, Brisbane QLD', kind: 'address' },
];

const SINGLE: MapPin[] = [PINS[1]];

// ─── Playground ───────────────────────────────────────────────────────────────

function MapDemo( { pins, label, width, height }: { pins: MapPin[]; label: string; width?: number; height?: number } )
{
    const [lastClicked, setLastClicked] = useState( 'none' );

    return (
        <Box sx={{ maxWidth: width }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                {label}
            </Typography>

            <MapView
                pins={pins}
                height={height ?? 300}
                onPinClick={pin => setLastClicked( pin.label )}
                emptyState={
                    <Typography variant="body2" color="text.secondary">
                        No mapped addresses
                    </Typography>
                }
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {pins.length} pin{pins.length === 1 ? '' : 's'} · last clicked: {lastClicked}
            </Typography>
        </Box>
    );
}

export function MapViewPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>MapView</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Pins on a map, with the library hidden behind <code>@/services/map</code>.
                The view fits its bounds to the pins, follows the theme (OpenStreetMap tiles
                in light, CARTO dark in dark), and leaves scroll-zoom off so it does not
                swallow the page scroll.
            </Typography>

            <Stack spacing={4}>
                <MapDemo pins={PINS} label="Several pins — fits bounds automatically" />
                <Divider />
                <MapDemo pins={SINGLE} label="Single pin — zoom capped so it is not street-level" />
                <Divider />
                <MapDemo pins={[]} label="Empty" height={200} />
                <Divider />
                <MapDemo pins={PINS} label="Narrow — as in the detail panel" width={420} height={240} />
            </Stack>

            <PlaygroundDataPreview
                title="MapPin[]"
                caption="kind is caller-defined; the renderer maps it to a pin colour only."
                data={PINS}
            />
        </Box>
    );
}

export default MapViewPlayground;
