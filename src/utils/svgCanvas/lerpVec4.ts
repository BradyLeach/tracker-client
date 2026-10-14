import type { Vec4 } from './types';

/**
 * Lerp a single value linearly.
 */
function lerp( a: number, b: number, t: number ): number 
{
    return a + ( b - a ) * t;
}

/**
 * Lerp a hue value (0–360) taking the shortest path around the hue wheel.
 */
function lerpHue( a: number, b: number, t: number ): number 
{
    let delta = b - a;
    // Wrap delta into [-180, 180] so we always take the short arc
    if( delta > 180 ) delta -= 360;
    if( delta < -180 ) delta += 360;
    return ( ( a + delta * t ) % 360 + 360 ) % 360;
}

/**
 * Lerp two HSLa Vec4 values [h, s, l, a].
 * Hue is interpolated via shortest-arc to avoid crossing the colour wheel.
 */
export function lerpVec4( a: Vec4, b: Vec4, t: number ): Vec4 
{
    return [
        lerpHue( a[0], b[0], t ),
        lerp( a[1], b[1], t ),
        lerp( a[2], b[2], t ),
        lerp( a[3], b[3], t ),
    ];
}
