import { describe, it, expect } from 'vitest';
import { vec4ToHsla, intensityToColor, intensityToLabel, INTENSITY_STOPS } from '@/utils/svgCanvas/colorScale';

describe('vec4ToHsla', () => {
    it('converts a full-opacity Vec4 to hsla string', () => {
        expect(vec4ToHsla([240, 80, 50, 1])).toBe('hsla(240, 80%, 50%, 1)');
    });

    it('converts a zero-alpha Vec4', () => {
        expect(vec4ToHsla([0, 0, 0, 0])).toBe('hsla(0, 0%, 0%, 0)');
    });

    it('handles partial alpha', () => {
        expect(vec4ToHsla([120, 80, 50, 0.5])).toBe('hsla(120, 80%, 50%, 0.5)');
    });

    it('handles max hue', () => {
        expect(vec4ToHsla([360, 100, 100, 1])).toBe('hsla(360, 100%, 100%, 1)');
    });
});

describe('intensityToColor', () => {
    it('clamps below 0 to the first stop colour', () => {
        const atZero = intensityToColor(0);
        const belowZero = intensityToColor(-0.5);
        expect(belowZero).toEqual(atZero);
    });

    it('clamps above 1 to the last stop colour', () => {
        const atOne = intensityToColor(1);
        const aboveOne = intensityToColor(1.5);
        expect(aboveOne).toEqual(atOne);
    });

    it('returns the exact colour at t=0 (Dormant stop)', () => {
        const result = intensityToColor(0);
        expect(result).toEqual(INTENSITY_STOPS[0].color);
    });

    it('returns the exact colour at t=1 (Injury Risk stop)', () => {
        const result = intensityToColor(1);
        expect(result).toEqual(INTENSITY_STOPS[INTENSITY_STOPS.length - 1].color);
    });

    it('returns the exact colour at each defined stop', () => {
        for (const stop of INTENSITY_STOPS) {
            const result = intensityToColor(stop.t);
            expect(result[0]).toBeCloseTo(stop.color[0], 5);
            expect(result[1]).toBeCloseTo(stop.color[1], 5);
            expect(result[2]).toBeCloseTo(stop.color[2], 5);
            expect(result[3]).toBeCloseTo(stop.color[3], 5);
        }
    });

    it('returns a Vec4 with 4 elements for any input', () => {
        const result = intensityToColor(0.5);
        expect(result).toHaveLength(4);
    });

    it('interpolates between stops (midpoint between first two)', () => {
        const lo = INTENSITY_STOPS[0];
        const hi = INTENSITY_STOPS[1];
        const mid = (lo.t + hi.t) / 2;
        const result = intensityToColor(mid);
        // Should be strictly between the two stop lightness values
        const loL = lo.color[2];
        const hiL = hi.color[2];
        const [min, max] = loL < hiL ? [loL, hiL] : [hiL, loL];
        expect(result[2]).toBeGreaterThanOrEqual(min);
        expect(result[2]).toBeLessThanOrEqual(max);
    });
});

describe('intensityToLabel', () => {
    it('returns the first stop label at t=0', () => {
        expect(intensityToLabel(0)).toBe(INTENSITY_STOPS[0].label);
    });

    it('returns the last stop label at t=1', () => {
        expect(intensityToLabel(1)).toBe(INTENSITY_STOPS[INTENSITY_STOPS.length - 1].label);
    });

    it('returns the correct label at each defined stop', () => {
        for (const stop of INTENSITY_STOPS) {
            expect(intensityToLabel(stop.t)).toBe(stop.label);
        }
    });

    it('clamps below 0 to the first stop label', () => {
        expect(intensityToLabel(-1)).toBe(INTENSITY_STOPS[0].label);
    });

    it('clamps above 1 to the last stop label', () => {
        expect(intensityToLabel(2)).toBe(INTENSITY_STOPS[INTENSITY_STOPS.length - 1].label);
    });

    it('returns the label of the last passed stop for midpoint values', () => {
        // Just above the second stop threshold should still return that stop's label
        const stop = INTENSITY_STOPS[1];
        expect(intensityToLabel(stop.t)).toBe(stop.label);
    });
});
