/**
 * Leaflet Implementation of the Map Service
 *
 * The ONLY file that knows about Leaflet. Swap this file to change map
 * library without touching app code.
 *
 * Four Leaflet specifics handled here rather than leaking outward:
 *
 * - Leaflet's default marker images are resolved by URL and 404 under a
 *   bundler. Pins are `divIcon`s built from our own markup instead, which also
 *   lets them take theme colours.
 * - A map needs an explicit height or it collapses to zero.
 * - Fitting bounds must happen after mount, via a child hook, because the map
 *   instance does not exist while props are first read.
 * - Opening a popup is imperative: there is no declarative "open" prop, so
 *   marker instances are kept to serve `focusPinId`.
 *
 * Tiles: OpenStreetMap in light, CARTO dark_all in dark. Both are free and
 * both require the attribution rendered below — do not remove it.
 */

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, useTheme } from '@/components/ui';
import type { MapPin, MapViewProps } from './map.types';

const TILES = {
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
} as const;

/** Sydney — a defensible centre when there is nothing to fit. */
const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

/**
 * Pin markup. A divIcon rather than an image, so pins inherit theme colours
 * and no asset has to resolve through the bundler.
 */
function buildPinIcon( colour: string ): L.DivIcon
{
    return L.divIcon( {
        className: '',
        html: `<span style="
            display:block;width:14px;height:14px;border-radius:50%;
            background:${colour};box-shadow:0 0 0 3px rgba(0,0,0,0.25);
        "></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8],
    } );
}

/**
 * Keeps the viewport on the pins.
 *
 * A child component because `useMap` needs the instance the MapContainer
 * creates, which is not available to its own props.
 */
function FitToPins( { pins, maxZoom }: { pins: readonly MapPin[]; maxZoom: number } )
{
    const map = useMap();

    useEffect( () =>
    {
        if( pins.length === 0 ) return;

        const bounds = L.latLngBounds( pins.map( pin => [pin.lat, pin.lng] as [number, number] ) );
        map.fitBounds( bounds, { padding: [32, 32], maxZoom } );
    }, [map, pins, maxZoom] );

    return null;
}

/**
 * Centres on the focused pin and opens its popup.
 *
 * Rendered after the markers so its effect runs after `FitToPins` — otherwise
 * a map mounted with a focus already set would be pulled back to the bounds of
 * every pin.
 */
function FocusPin( {
    pin,
    markers,
    zoom,
}: {
    pin?: MapPin;
    markers: Map<string, L.Marker>;
    zoom: number;
} )
{
    const map = useMap();

    useEffect( () =>
    {
        if( !pin ) return;

        // Never zoom out to focus: the user may have zoomed in past `zoom`.
        map.setView( [pin.lat, pin.lng], Math.max( map.getZoom(), zoom ) );
        markers.get( pin.id )?.openPopup();
    }, [map, pin, markers, zoom] );

    return null;
}

export function LeafletMapView( {
    pins,
    height = 320,
    fallbackCenter = DEFAULT_CENTER,
    fallbackZoom = 10,
    maxFitZoom = 13,
    scrollWheelZoom = false,
    emptyState,
    onPinClick,
    focusPinId,
}: MapViewProps )
{
    const theme = useTheme();
    const tiles = theme.palette.mode === 'dark' ? TILES.dark : TILES.light;

    // Popups are opened through the marker instance; react-leaflet exposes no
    // declarative "open" prop.
    const markers = useRef( new Map<string, L.Marker>() ).current;

    const focusPin = focusPinId ? pins.find( pin => pin.id === focusPinId ) : undefined;

    // Two colours only: the caller's `kind` is opaque here, so anything that
    // is not the primary category takes the secondary tone.
    const icons = useMemo( () => ( {
        primary: buildPinIcon( theme.palette.primary.main ),
        secondary: buildPinIcon( theme.palette.text.secondary ),
    } ), [theme.palette.primary.main, theme.palette.text.secondary] );

    if( pins.length === 0 && emptyState )
    {
        return (
            <Box
                sx={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    backgroundColor: 'background.sunk',
                    border: '1px solid',
                    borderColor: 'border.base',
                }}
            >
                {emptyState}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'border.base',
                // Leaflet paints its own white ground before tiles load, which
                // flashes against a dark page.
                '& .leaflet-container': {
                    height: '100%',
                    width: '100%',
                    backgroundColor: theme.palette.background.sunk,
                    fontFamily: theme.typography.fontFamily,
                },
                '& .leaflet-control-attribution': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    fontSize: 10,
                },
                '& .leaflet-control-attribution a': { color: theme.palette.primary.main },
            }}
        >
            <MapContainer
                center={[fallbackCenter.lat, fallbackCenter.lng]}
                zoom={fallbackZoom}
                scrollWheelZoom={scrollWheelZoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer url={tiles.url} attribution={tiles.attribution} />

                <FitToPins pins={pins} maxZoom={maxFitZoom} />

                {pins.map( pin => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={pin.kind === 'location' ? icons.secondary : icons.primary}
                        eventHandlers={onPinClick ? { click: () => onPinClick( pin ) } : undefined}
                        ref={marker =>
                        {
                            if( marker ) markers.set( pin.id, marker );
                            else markers.delete( pin.id );
                        }}
                    >
                        <Popup>
                            <Typography variant="subtitle2" sx={{ textTransform: 'none' }}>
                                {pin.label}
                            </Typography>
                            {pin.description && (
                                <Typography variant="caption" color="text.secondary">
                                    {pin.description}
                                </Typography>
                            )}
                        </Popup>
                    </Marker>
                ) )}

                <FocusPin pin={focusPin} markers={markers} zoom={maxFitZoom} />
            </MapContainer>
        </Box>
    );
}

export default LeafletMapView;
