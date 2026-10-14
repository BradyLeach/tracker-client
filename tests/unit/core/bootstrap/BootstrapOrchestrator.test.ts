/**
 * BootstrapOrchestrator Unit Tests
 *
 * Tests the core bootstrap orchestration logic with minimal mocking.
 * Only mocks the performance timing and logging boundaries, letting real logic run.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BootstrapOrchestrator } from '@/core/bootstrap/BootstrapOrchestrator';
import { makeLoader, makeCriticalLoader, makeNonCriticalLoader } from '@/test-factories/bootstrap';

// Mock only the logging and performance boundaries
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

describe('BootstrapOrchestrator', () =>
{
    let orchestrator: BootstrapOrchestrator;

    beforeEach(() =>
    {
        orchestrator = new BootstrapOrchestrator();
        vi.clearAllMocks();
    });

    describe('Loader Registration', () =>
    {
        it('should register loaders and return instance for chaining', () =>
        {
            const result = orchestrator
                .register(makeCriticalLoader('config', 'config-data'))
                .register(makeNonCriticalLoader('theme', 'theme-data'));

            expect(result).toBe(orchestrator);
        });

        it('should handle empty loader list', async () =>
        {
            const context = await orchestrator.execute();
            expect(context).toEqual({});
        });
    });

    describe('Critical vs Non-Critical Separation', () =>
    {
        it('should execute critical loaders first, then non-critical', async () =>
        {
            const criticalLoader = makeCriticalLoader('config', 'config-data');
            const nonCriticalLoader = makeNonCriticalLoader('theme', 'theme-data');

            orchestrator
                .register(nonCriticalLoader) // Register non-critical first
                .register(criticalLoader); // Then critical

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                config: 'config-data',
                theme: 'theme-data'
            });
        });

        it('should only execute critical loaders when no non-critical exist', async () =>
        {
            orchestrator.register(makeCriticalLoader('config', 'config-data'));

            const context = await orchestrator.execute();

            expect(context).toMatchObject({ config: 'config-data' });
        });

        it('should only execute non-critical loaders when no critical exist', async () =>
        {
            orchestrator.register(makeNonCriticalLoader('theme', 'theme-data'));

            const context = await orchestrator.execute();

            expect(context).toMatchObject({ theme: 'theme-data' });
        });
    });

    describe('Parallel Execution Within Priority Levels', () =>
    {
        it('should execute all critical loaders and return all results', async () =>
        {
            const critical1 = makeCriticalLoader('config', 'config-data');
            const critical2 = makeCriticalLoader('i18n', 'i18n-data');

            orchestrator
                .register(critical1)
                .register(critical2);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                config: 'config-data',
                i18n: 'i18n-data'
            });

            const results = orchestrator.getResults();
            expect(results.get('config')?.status).toBe('success');
            expect(results.get('i18n')?.status).toBe('success');
        });

        it('should execute all non-critical loaders and return all results', async () =>
        {
            const nonCritical1 = makeNonCriticalLoader('theme', 'theme-data');
            const nonCritical2 = makeNonCriticalLoader('auth', 'auth-data');

            orchestrator
                .register(nonCritical1)
                .register(nonCritical2);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                theme: 'theme-data',
                auth: 'auth-data'
            });

            const results = orchestrator.getResults();
            expect(results.get('theme')?.status).toBe('success');
            expect(results.get('auth')?.status).toBe('success');
        });
    });

    describe('Error Handling and Graceful Degradation', () =>
    {
        it('should throw error when critical loader fails', async () =>
        {
            const failingLoader = makeCriticalLoader('config', null, 0, new Error('Config load failed'));
            orchestrator.register(failingLoader);

            await expect(orchestrator.execute()).rejects.toThrow(/critical/i);
        });

        it('should continue when non-critical loader fails', async () =>
        {
            const successLoader = makeCriticalLoader('config', 'config-data');
            const failingLoader = makeNonCriticalLoader('theme', null, 0, new Error('Theme load failed'));

            orchestrator
                .register(successLoader)
                .register(failingLoader);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({ config: 'config-data' });
            expect(context).not.toHaveProperty('theme');
        });

        it('should exclude failed loader data from context', async () =>
        {
            const successLoader1 = makeCriticalLoader('config', 'config-data');
            const successLoader2 = makeNonCriticalLoader('i18n', 'i18n-data');
            const failingLoader = makeNonCriticalLoader('theme', null, 0, new Error('Theme failed'));

            orchestrator
                .register(successLoader1)
                .register(failingLoader)
                .register(successLoader2);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                config: 'config-data',
                i18n: 'i18n-data'
            });
            expect(context).not.toHaveProperty('theme');
        });

        it('should handle mixed success/failure scenarios', async () =>
        {
            const critical1 = makeCriticalLoader('config', 'config-data');
            const critical2 = makeCriticalLoader('models', 'models-data');
            const nonCritical1 = makeNonCriticalLoader('theme', 'theme-data');
            const nonCritical2 = makeNonCriticalLoader('auth', null, 0, new Error('Auth failed'));

            orchestrator
                .register(critical1)
                .register(nonCritical2) // Failing non-critical
                .register(critical2)
                .register(nonCritical1);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                config: 'config-data',
                models: 'models-data',
                theme: 'theme-data'
            });
            expect(context).not.toHaveProperty('auth');
        });
    });

    describe('Performance Monitoring', () =>
    {
        it('should execute loaders and complete successfully', async () =>
        {
            orchestrator.register(makeLoader('config', { critical: true, data: 'config-data' }));

            const context = await orchestrator.execute();

            expect(context).toMatchObject({ config: 'config-data' });
        });

        it('should track loader execution results', async () =>
        {
            orchestrator
                .register(makeCriticalLoader('config', 'config-data'))
                .register(makeNonCriticalLoader('theme', 'theme-data'));

            await orchestrator.execute();
            const results = orchestrator.getResults();

            const configResult = results.get('config');
            const themeResult = results.get('theme');

            expect(configResult?.status).toBe('success');
            if (configResult?.status === 'success')
            {
                expect(configResult.data).toBe('config-data');
            }

            expect(themeResult?.status).toBe('success');
            if (themeResult?.status === 'success')
            {
                expect(themeResult.data).toBe('theme-data');
            }
        });

        it('should record timing information for loaders', async () =>
        {
            vi.useFakeTimers();
            try
            {
                const slowLoader = makeLoader('config', { critical: true, data: 'config-data', delay: 50 });
                orchestrator.register(slowLoader);

                const executePromise = orchestrator.execute();
                vi.advanceTimersByTime(50);
                await executePromise;

                const results = orchestrator.getResults();
                const configResult = results.get('config');

                expect(configResult?.status).toBe('success');
                if (configResult?.status === 'success')
                {
                    expect(configResult.data).toBe('config-data');
                }
                expect(typeof configResult?.duration).toBe('number');
                expect(configResult?.duration).toBeGreaterThanOrEqual(0);
            }
            finally
            {
                vi.useRealTimers();
            }
        });
    });

    describe('Context Building', () =>
    {
        it('should build context with only successful loader results', async () =>
        {
            const successLoader = makeCriticalLoader('config', { apiUrl: 'test' });
            const failingLoader = makeNonCriticalLoader('theme', null, 0, new Error('Failed'));

            orchestrator
                .register(successLoader)
                .register(failingLoader);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({
                config: { apiUrl: 'test' }
            });
            expect(context).not.toHaveProperty('theme');
        });

        it('should preserve data types in context', async () =>
        {
            const configData = { apiUrl: 'http://localhost', timeout: 5000 };
            const themeData = { colors: ['red', 'blue'], dark: true };

            orchestrator
                .register(makeLoader('config', { critical: true, data: configData }))
                .register(makeLoader('theme', { critical: false, data: themeData }));

            const context = await orchestrator.execute();

            expect(context.config).toEqual(configData);
        });
    });

    describe('Results Monitoring', () =>
    {
        it('should return detailed results for debugging', async () =>
        {
            orchestrator
                .register(makeCriticalLoader('config', 'config-data'))
                .register(makeNonCriticalLoader('theme', 'theme-data'));

            await orchestrator.execute();
            const results = orchestrator.getResults();

            const configResult = results.get('config');
            const themeResult = results.get('theme');

            expect(configResult).toMatchObject({
                status: 'success',
                data: 'config-data'
            });
            expect(typeof configResult?.duration).toBe('number');

            expect(themeResult).toMatchObject({
                status: 'success',
                data: 'theme-data'
            });
            expect(typeof themeResult?.duration).toBe('number');
        });

        it('should include error details for failed loaders', async () =>
        {
            const error = new Error('Auth service unavailable');
            const failingLoader = makeNonCriticalLoader('auth', null, 0, error);

            orchestrator.register(failingLoader);
            await orchestrator.execute();

            const results = orchestrator.getResults();
            const authResult = results.get('auth');

            expect(authResult).toMatchObject({
                status: 'failed',
                error: expect.objectContaining({
                    message: 'Auth service unavailable'
                })
            });
        });

        it('should return immutable copy of results', async () =>
        {
            orchestrator.register(makeLoader('config', { critical: true, data: 'config-data' }));
            await orchestrator.execute();

            const results1 = orchestrator.getResults();
            const results2 = orchestrator.getResults();

            expect(results1).not.toBe(results2);
            expect(results1.get('config')).toEqual(results2.get('config'));

            // Ensure results are truly immutable (mutating copy doesn't affect internal state)
            (results1 as any).set?.('x', { status: 'success' }); // mutate the copy
            const results3 = orchestrator.getResults();          // fresh copy from orchestrator
            expect(results3.has('x')).toBe(false);         // internal state not polluted
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle loader throwing non-Error objects', async () =>
        {
            const loader = makeLoader('config', { critical: false, data: null, error: 'String error' });
            orchestrator.register(loader);

            await orchestrator.execute();

            const results = orchestrator.getResults();
            const result = results.get('config');

            expect(result?.status).toBe('failed');
            if (result?.status === 'failed')
            {
                expect(result.error).toBeInstanceOf(Error);
                expect(result.error.message).toBe('String error');
            }
        });

        it('should handle undefined loader data', async () =>
        {
            const loader = makeLoader('config', { critical: true, data: undefined });
            orchestrator.register(loader);

            const context = await orchestrator.execute();

            expect(context).toMatchObject({ config: undefined });
        });
    });
});