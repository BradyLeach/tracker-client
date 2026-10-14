/**
 * Projects a muscle's current intensity scalar forward by a proposed training load.
 *
 * Both inputs are clamped to [0, 1] before addition.
 * Result is clamped to [0, 1] — hitting 1.0 is valid and means injury risk zone.
 *
 * Example: projectIntensity(0.75, 0.30) === 1.0
 */
export function projectIntensity( current: number, load: number ): number 
{
    const clampedCurrent = Math.min( Math.max( current, 0 ), 1 );
    const clampedLoad = Math.min( Math.max( load, 0 ), 1 );
    return Math.min( clampedCurrent + clampedLoad, 1 );
}
