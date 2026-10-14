/**
 * BootstrapOrchestrator Integration Tests
 *
 * Tests with real timers to catch timing-related issues that unit tests with fake timers might miss.
 * Complements the unit tests by verifying actual performance characteristics.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BootstrapOrchestrator } from '@/core/bootstrap/BootstrapOrchestrator';
import { makeLoader, makeCriticalLoader, makeNonCriticalLoader } from '@/test-factories/bootstrap';

// Mock only the logging boundary for clean output
vi.mock('@/core/utils/logger', () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    },
    performanceLogger: {
        start: vi.fn(() => ({
            end: vi.fn(() => ({ duration: 123.45 }))
        }))
    }
}));

describe('BootstrapOrchestrator Integration Tests', () =>
{
    let orchestrator: BootstrapOrchestrator;

    beforeEach(() =>
    {
        orchestrator = new BootstrapOrchestrator();
        vi.clearAllMocks();
        vi.useRealTimers(); // Use real timers for integration testing
    });

    describe('Real Timing Behavior', () =>
    {
        it('should execute parallel loaders faster than sequential', async () =>
        {
            // Create loaders with small but measurable delays
            const loader1 = makeCriticalLoader('config', 'config-data', 20);
            const loader2 = makeCriticalLoader('i18n', 'i18n-data', 30);

            orchestrator
                .register(loader1)
                .register(loader2);

            const startTime = Date.now();
            await orchestrator.execute();
            const endTime = Date.now();
            const parallelDuration = endTime - startTime;

            // Should complete faster than sequential execution (30ms + 20ms = 50ms)
            // Test the behavior, not exact timing
            expect(parallelDuration).toBeLessThan(50); // Must be faster than sequential
            expect(parallelDuration).toBeGreaterThan(20); // At least some delay occurred
        });

        it('should record accurate timing information with real delays', async () =>
        {
            const expectedDelay = 25;
            const loader = makeLoader('config', { critical: true, data: 'config-data', delay: expectedDelay });
            orchestrator.register(loader);

            await orchestrator.execute();
            const results = orchestrator.getResults();
            const result = results.get('config');

            expect(result?.status).toBe('success');
            expect(result?.duration).toBeGreaterThan(expectedDelay - 5); // Allow 5ms margin
            expect(result?.duration).toBeLessThan(expectedDelay + 15); // Allow 15ms margin for overhead
        });

        it('should handle mixed critical and non-critical timing correctly', async () =>
        {
            const criticalLoader = makeCriticalLoader('config', 'config-data', 15);
            const nonCriticalLoader1 = makeNonCriticalLoader('theme', 'theme-data', 10);
            const nonCriticalLoader2 = makeNonCriticalLoader('auth', 'auth-data', 20);

            orchestrator
                .register(criticalLoader)
                .register(nonCriticalLoader1)
                .register(nonCriticalLoader2);

            const startTime = Date.now();
            const context = await orchestrator.execute();
            const endTime = Date.now();

            // Should have all data
            expect(context).toEqual({
                config: 'config-data',
                theme: 'theme-data',
                auth: 'auth-data'
            });

            // Total time should be roughly: critical phase (15ms) + non-critical phase (20ms) = ~35ms
            const totalDuration = endTime - startTime;
            expect(totalDuration).toBeLessThan(50); // Generous upper bound
            expect(totalDuration).toBeGreaterThan(30); // Should take at least the sum of phases
        });
    });

    describe('Error Handling with Real Timing', () =>
    {
        it('should fail fast on critical loader errors', async () =>
        {
            const fastCritical = makeCriticalLoader('config', null, 10, new Error('Config failed'));
            const slowNonCritical = makeNonCriticalLoader('theme', 'theme-data', 100);

            orchestrator
                .register(fastCritical)
                .register(slowNonCritical);

            const startTime = Date.now();

            await expect(orchestrator.execute()).rejects.toThrow();

            const endTime = Date.now();

            // Should fail quickly (~10ms) without waiting for slow non-critical loader
            expect(endTime - startTime).toBeLessThan(30);
        });
    });

    describe('Performance Characteristics', () =>
    {
        it('should scale reasonably with number of loaders', async () =>
        {
            // Test with multiple loaders to verify parallel execution scaling
            const loaders = Array.from({ length: 5 }, (_, i) =>
                makeNonCriticalLoader(`loader${i}`, `data${i}`, 15)
            );

            loaders.forEach(loader => orchestrator.register(loader));

            const startTime = Date.now();
            await orchestrator.execute();
            const endTime = Date.now();

            // 5 loaders in parallel should still complete in roughly 15ms + overhead
            // Much faster than 5 * 15ms = 75ms sequential
            expect(endTime - startTime).toBeLessThan(40);
        });
    });
});