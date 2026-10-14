/**
 * Limit Enforcer Unit Tests
 *
 * Behavior-focused tests for limit rule enforcer.
 * Tests decision logic (allow/block) based on count vs limit.
 * Tests return RuleCheckResult with enforcer codes (no UI components).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RuleCheckContext } from '@/core/businessRules/types';
import type { LimitRule } from '@/core/businessRules/checkers/limitHandlers';
import { RULE_CODES } from '@/core/businessRules/ruleCodes';

// Mock the dataService boundary
vi.mock('@/services/dataService/dataService', () => ({
    dataService: {
        getMetadata: vi.fn(),
    }
}));

// Import after mock is set up
import { checkLimit } from '@/core/businessRules/checkers/limit.checker';
import { dataService } from '@/services/dataService/dataService';

describe('checkLimit - Behavior', () =>
{
    let context: RuleCheckContext;
    let limitRule: LimitRule;

    beforeEach(() =>
    {
        vi.clearAllMocks();

        context = {
            service: 'program',
            operation: 'create',
        };

        limitRule = { max: 5 };
    });

    describe('When user is under limit', () =>
    {
        it('should allow operation', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 2 });

            const result = await checkLimit(limitRule, context);

            expect(result.allowed).toBe(true);
            expect(result.service).toBe('program');
            expect(result.operation).toBe('create');
        });

        it('should include count data', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 2 });

            const result = await checkLimit(limitRule, context);

            expect(result.data).toMatchObject({
                current: 2,
                max: 5,
            });
        });
    });

    describe('When user has reached max limit', () =>
    {
        it('should block operation', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 5 });

            const result = await checkLimit(limitRule, context);

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.LIMIT);
        });

        it('should include limit data', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 5 });

            const result = await checkLimit(limitRule, context);

            expect(result.data).toMatchObject({
                key: 'max',
                max: 5,
                current: 5,
            });
        });
    });

    describe('When user has exceeded max limit', () =>
    {
        it('should block operation', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 10 });

            const result = await checkLimit(limitRule, context);

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.LIMIT);
        });
    });

    describe('When checking min limit', () =>
    {
        it('should block deletion when at minimum', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 1 });

            const minRule = { min: 1 };
            const result = await checkLimit(minRule, context);

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.LIMIT);
        });

        it('should allow deletion when above minimum', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 3 });

            const minRule = { min: 1 };
            const result = await checkLimit(minRule, context);

            expect(result.allowed).toBe(true);
        });
    });

    describe('When limit check fails', () =>
    {
        it('should fail open and allow operation', async () =>
        {
            vi.mocked(dataService.getMetadata).mockRejectedValue(new Error('Network error'));

            const result = await checkLimit(limitRule, context);

            expect(result.allowed).toBe(true);
        });
    });

    describe('When rule has no limits', () =>
    {
        it('should allow operation when max and min are missing', async () =>
        {
            const emptyRule = {};

            const result = await checkLimit(emptyRule, context);

            expect(result.allowed).toBe(true);
        });
    });
});
