import { describe, it, expect } from 'vitest';
import { lerpVec4 } from '@/utils/svgCanvas/lerpVec4';

describe('lerpVec4', () => {
    it('returns a at t=0', () => {
        const a = [0, 0, 0, 0] as [number, number, number, number];
        const b = [360, 100, 100, 1] as [number, number, number, number];
        expect(lerpVec4(a, b, 0)).toEqual([0, 0, 0, 0]);
    });

    it('returns b at t=1', () => {
        const a = [0, 0, 0, 0] as [number, number, number, number];
        const b = [270, 100, 100, 1] as [number, number, number, number];
        expect(lerpVec4(a, b, 1)).toEqual([270, 100, 100, 1]);
    });

    it('returns midpoint at t=0.5 (non-wrapping hues)', () => {
        const a = [0, 0, 0, 0] as [number, number, number, number];
        const b = [180, 100, 100, 1] as [number, number, number, number];
        expect(lerpVec4(a, b, 0.5)).toEqual([90, 50, 50, 0.5]);
    });

    it('degenerate case: hue 0 and hue 360 are the same colour — no arc to travel', () => {
        // 0 and 360 are identical hues; shortest arc is 0, so midpoint stays at 0
        const a = [0, 0, 0, 0] as [number, number, number, number];
        const b = [360, 100, 100, 1] as [number, number, number, number];
        const result = lerpVec4(a, b, 0.5);
        expect(result[0]).toBeCloseTo(0);
        expect(result[1]).toBe(50);
        expect(result[2]).toBe(50);
        expect(result[3]).toBe(0.5);
    });

    it('takes the short arc across the 0/360 boundary (240 → 0, i.e. going via 300)', () => {
        // Shortest arc from 240→360(=0) is +120° (via 300), NOT −240°
        const a = [240, 80, 50, 1] as [number, number, number, number];
        const b = [0, 80, 50, 1] as [number, number, number, number];
        const result = lerpVec4(a, b, 0.5);
        expect(result[0]).toBeCloseTo(300); // midpoint of the 120° short arc
        expect(result[1]).toBe(80);
        expect(result[2]).toBe(50);
        expect(result[3]).toBe(1);
    });
});
