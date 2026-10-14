import { describe, it, expect } from 'vitest';
import { projectIntensity } from '@/utils/svgCanvas/projection';

describe('projectIntensity', () => {
    it('adds current and load with no clamping needed', () => {
        expect(projectIntensity(0.3, 0.2)).toBeCloseTo(0.5);
    });

    it('clamps result to 1.0 when sum exceeds 1', () => {
        expect(projectIntensity(0.75, 0.30)).toBe(1.0);
    });

    it('returns 0 when both inputs are 0', () => {
        expect(projectIntensity(0, 0)).toBe(0);
    });

    it('returns 1 when both inputs are 1', () => {
        expect(projectIntensity(1, 1)).toBe(1);
    });

    it('clamps negative current to 0 before adding', () => {
        expect(projectIntensity(-0.5, 0.3)).toBeCloseTo(0.3);
    });

    it('clamps negative load to 0 before adding', () => {
        expect(projectIntensity(0.3, -0.5)).toBeCloseTo(0.3);
    });

    it('clamps current above 1 to 1 before adding', () => {
        // current=1.5 clamped to 1, load=0.5 clamped to 0.5 → 1.5 → 1
        expect(projectIntensity(1.5, 0.5)).toBe(1);
    });

    it('handles exact boundary: current=0.5 + load=0.5 = 1.0', () => {
        expect(projectIntensity(0.5, 0.5)).toBe(1.0);
    });
});
