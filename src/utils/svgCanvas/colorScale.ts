import type { Vec4 } from './types';
import { lerpVec4 } from './lerpVec4';

export interface IntensityStop {
    t: number;
    color: Vec4;
    label: string;
}

export const INTENSITY_STOPS: IntensityStop[] = [
    { t: 0.00, color: [0, 0, 70, 1], label: 'Dormant' },
    { t: 0.15, color: [220, 80, 55, 1], label: 'Rested' },
    { t: 0.35, color: [130, 70, 45, 1], label: 'Optimal' },
    { t: 0.55, color: [55, 90, 55, 1], label: 'Working' },
    { t: 0.70, color: [28, 90, 50, 1], label: 'Heavy' },
    { t: 0.85, color: [0, 80, 45, 1], label: 'Limit' },
    { t: 1.00, color: [350, 90, 30, 1], label: 'Injury Risk' },
];

export function vec4ToHsla( color: Vec4 ): string 
{
    const [h, s, l, a] = color;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function intensityToColor( t: number ): Vec4 
{
    const clamped = Math.min( 1, Math.max( 0, t ) );

    // Find the two bracketing stops
    let lo = INTENSITY_STOPS[0];
    let hi = INTENSITY_STOPS[INTENSITY_STOPS.length - 1];

    for( let i = 0; i < INTENSITY_STOPS.length - 1; i++ ) 
    {
        if( clamped >= INTENSITY_STOPS[i].t && clamped <= INTENSITY_STOPS[i + 1].t ) 
        {
            lo = INTENSITY_STOPS[i];
            hi = INTENSITY_STOPS[i + 1];
            break;
        }
    }

    // Normalise t within the segment
    const segmentLength = hi.t - lo.t;
    const segmentT = segmentLength === 0 ? 0 : ( clamped - lo.t ) / segmentLength;

    return lerpVec4( lo.color, hi.color, segmentT );
}

export function intensityToLabel( t: number ): string 
{
    const clamped = Math.min( 1, Math.max( 0, t ) );

    // Return the label of the last stop whose t is ≤ clamped input
    let label = INTENSITY_STOPS[0].label;
    for( const stop of INTENSITY_STOPS ) 
    {
        if( stop.t <= clamped ) 
        {
            label = stop.label;
        }
    }
    return label;
}
