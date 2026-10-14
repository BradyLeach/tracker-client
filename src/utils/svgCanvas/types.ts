import type { ReactNode } from 'react';

export type Vec4 = [number, number, number, number];

export interface SvgCanvasProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    children: ReactNode;
}

export interface SvgLayerProps {
    color: Vec4;
    scale?: number;
    zIndex?: number;
    children: ReactNode;
}
