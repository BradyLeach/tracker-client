/**
 * ConfigLoader Bootstrap Integration Tests
 *
 * Tests the ConfigLoader as a bootstrap integration layer.
 * The actual config loading logic is tested in src/config tests.
 *
 * This only tests:
 * - ConfigLoader delegates to getConfig()
 * - Bootstrap-specific validation (HTTPS check, etc.)
 * - Integration with bootstrap orchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigLoader, resetForTesting } from '@/core/bootstrap/loaders/ConfigLoader';
import * as configModule from '@/config';
import type { AppConfig } from '@/../config/types';

// Mock the config module
vi.mock('@/config', async (importOriginal) =>
{
    const actual = await importOriginal<typeof import('@/config')>();
    return {
        ...actual,
        getConfig: vi.fn(),
        resetConfig: vi.fn()
    };
});

const mockGetConfig = vi.mocked(configModule.getConfig);
const mockResetConfig = vi.mocked(configModule.resetConfig);

// Helper to create mock config
const createMockConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
    environment: 'development',
    apiConfig: {
        baseUrl: 'http://localhost:3000/api',
        version: '1.0.0',
        timeout: 30000,
        maxRetries: 3,
    },
    features: {
        devTools: true,
        errorReporting: false,
        performanceMonitoring: false,
    },
    security: {
        enableCSP: false,
        apiTimeout: 30000,
        maxRetries: 3,
    },
    monitoring: {
        enableLogging: true,
        logLevel: 'debug',
        enableMetrics: false,
    },
    ui: {} as any,
    validation: {} as any,
    ...overrides,
} as AppConfig);

describe('ConfigLoader', () =>
{
    let loader: ConfigLoader;

    beforeEach(() =>
    {
        vi.clearAllMocks();
        loader = new ConfigLoader();
    });

    describe('Bootstrap Integration', () =>
    {
        it('should be marked as critical', () =>
        {
            expect(loader.critical).toBe(true);
        });

        it('should have name "config"', () =>
        {
            expect(loader.name).toBe('config');
        });

        it('should delegate to getConfig() and return config', async () =>
        {
            const mockConfig = createMockConfig();
            mockGetConfig.mockReturnValue(mockConfig);

            const result = await loader.load();

            expect(mockGetConfig).toHaveBeenCalled();
            expect(result).toBe(mockConfig);
        });
    });

    describe('Bootstrap Validation', () =>
    {
        it('should pass validation for valid development config', async () =>
        {
            const mockConfig = createMockConfig({
                environment: 'development',
                apiConfig: { baseUrl: 'http://localhost:3000/api' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).resolves.toBe(mockConfig);
        });

        it('should pass validation for localhost HTTP in production', async () =>
        {
            const mockConfig = createMockConfig({
                environment: 'production',
                apiConfig: { baseUrl: 'http://localhost:3000/api' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).resolves.toBe(mockConfig);
        });

        it('should pass validation for 127.0.0.1 HTTP in production', async () =>
        {
            const mockConfig = createMockConfig({
                environment: 'production',
                apiConfig: { baseUrl: 'http://127.0.0.1:3000/api' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).resolves.toBe(mockConfig);
        });

        it('should pass validation for HTTPS in production', async () =>
        {
            const mockConfig = createMockConfig({
                environment: 'production',
                apiConfig: { baseUrl: 'https://api.example.com' } as any,
                features: { errorReporting: true } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).resolves.toBe(mockConfig);
        });

        it('should throw error for missing API URL', async () =>
        {
            const mockConfig = createMockConfig({
                apiConfig: { baseUrl: '' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).rejects.toThrow(/API base URL is required/i);
        });

        it('should throw error for HTTP in production (non-localhost)', async () =>
        {
            const mockConfig = createMockConfig({
                environment: 'production',
                apiConfig: { baseUrl: 'http://api.example.com' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).rejects.toThrow(/HTTPS/i);
        });

        it('should throw error for invalid URL format', async () =>
        {
            const mockConfig = createMockConfig({
                apiConfig: { baseUrl: 'not-a-valid-url' } as any,
            });
            mockGetConfig.mockReturnValue(mockConfig);

            await expect(loader.load()).rejects.toThrow(/Invalid API URL format/i);
        });
    });

    describe('Test Utilities', () =>
    {
        it('should reset config via resetForTesting()', () =>
        {
            resetForTesting();

            expect(mockResetConfig).toHaveBeenCalledOnce();
        });
    });
});
