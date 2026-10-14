/**
 * Map Service - Types
 *
 * Library-agnostic. Nothing here names Leaflet, so swapping the renderer is a
 * one-file change. Coordinates are plain numbers, not library value objects.
 */

import type { ReactNode } from 'react';

/** A point on the map. */
export interface MapCoordinates
{
    lat: number;
    lng: number;
}

/** A marker. `kind` lets a renderer style pins without knowing the domain. */
export interface MapPin extends MapCoordinates
{
    id: string;
    /** Shown in the pin's popup. */
    label: string;
    /** Secondary popup line, e.g. an address. */
    description?: string;
    /**
     * Caller-defined category, e.g. 'address' | 'location'. The renderer maps
     * it to a colour; it carries no meaning here.
     */
    kind?: string;
}

export interface MapViewProps
{
    pins: readonly MapPin[];
    /**
     * Map height. A map has no intrinsic height and collapses to nothing
     * without one.
     */
    height?: number | string;
    /** Centre when there are no pins to fit. */
    fallbackCenter?: MapCoordinates;
    fallbackZoom?: number;
    /** Cap the zoom when fitting to pins, so a single pin is not street-level. */
    maxFitZoom?: number;
    /** Whether scroll over the map zooms it. Off by default — a map inside a
     *  scrolling page that swallows the wheel is a trap. */
    scrollWheelZoom?: boolean;
    /** Rendered when there are no pins. */
    emptyState?: ReactNode;
    onPinClick?: ( pin: MapPin ) => void;
    /**
     * Pin to centre on and open. Selection state that lives outside the map —
     * a list beside it holds the same id — so the map follows it whenever it is
     * mounted, including on first render.
     *
     * An id that matches no pin is ignored rather than clearing the view.
     */
    focusPinId?: string;
}
