/**
   * useRuleCheck Hook Behavior Tests
   *
   * Tests the actual behaviors that matter:
   * - Does it allow/block correctly based on rule results?
   * - Does it expose data needed for UI decisions (thresholds)?
   * - Does it fail safely when things go wrong?
   */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRuleCheck } from '@/core/businessRules/useRuleCheck';
import { ruleEngine } from '@/core/businessRules/RuleEngine';
import { RULE_CODES } from '@/core/businessRules/ruleCodes';

vi.mock('@/core/businessRules/RuleEngine', () => ({
    ruleEngine: { check: vi.fn() }
}));

describe('useRuleCheck - Business Behavior', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    it('blocks users who have reached their resource limit', async () =>
    {
        vi.mocked(ruleEngine.check).mockResolvedValue({
            allowed: false,
            enforcer: RULE_CODES.LIMIT,
            service: 'program',
            operation: 'create',
            data: { current: 10, max: 10 },
        });

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create' })
        );

        await waitFor(() =>
        {
            expect(result.current.allowed).toBe(false);
        });
    });

    it('allows users who are under their resource limit', async () =>
    {
        vi.mocked(ruleEngine.check).mockResolvedValue({
            allowed: true,
            service: 'program',
            operation: 'create',
            data: { current: 3, max: 10 },
        });

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create' })
        );

        await waitFor(() =>
        {
            expect(result.current.allowed).toBe(true);
        });
    });

    it('exposes usage data for parent to calculate warning thresholds', async () =>
    {
        vi.mocked(ruleEngine.check).mockResolvedValue({
            allowed: true,
            service: 'program',
            operation: 'create',
            data: { current: 8, max: 10 },
        });

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create' })
        );

        await waitFor(() =>
        {
            // Parent needs this data to show "You're using 8 of 10 slots"
            expect(result.current.result?.data.current).toBe(8);
            expect(result.current.result?.data.max).toBe(10);
        });
    });

    it('blocks underage users from accessing age-restricted content', async () =>
    {
        vi.mocked(ruleEngine.check).mockResolvedValue({
            allowed: false,
            enforcer: RULE_CODES.VERIFICATION,
            service: 'identity',
            operation: 'access',
            specific: 'age',
            data: { minAge: 18, actualAge: 16 },
        });

        const { result } = renderHook(() =>
            useRuleCheck({
                service: 'identity',
                operation: 'access',
                context: { userAge: 16, minAge: 18 }
            })
        );

        await waitFor(() =>
        {
            expect(result.current.allowed).toBe(false);
        });
    });

    it('allows users when rule check service fails (fail-open for availability)', async () =>
    {
        vi.mocked(ruleEngine.check).mockRejectedValue(
            new Error('Rule service unavailable')
        );

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create' })
        );

        await waitFor(() =>
        {
            // Business decision: availability over enforcement
            expect(result.current.allowed).toBe(true);
        });
    });

    it('provides loading state while rule check runs', () =>
    {
        vi.mocked(ruleEngine.check).mockImplementation(
            () => new Promise(() => { }) // Simulates slow network
        );

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create' })
        );

        // User sees loading skeleton instead of broken UI
        expect(result.current.isLoading).toBe(true);
    });

    it('exposes which verification failed for targeted error messages', async () =>
    {
        vi.mocked(ruleEngine.check).mockResolvedValue({
            allowed: false,
            enforcer: RULE_CODES.VERIFICATION,
            service: 'identity',
            operation: 'access',
            specific: 'email',
            data: { emailVerified: false },
        });

        const { result } = renderHook(() =>
            useRuleCheck({ service: 'identity', operation: 'access' })
        );

        await waitFor(() =>
        {
            // Parent shows "Please verify your email" not generic "Access denied"
            expect(result.current.result?.specific).toBe('email');
        });
    });

    it('fires onResolved callback with full result', async () =>
    {
        const mockResult = {
            allowed: false,
            enforcer: RULE_CODES.LIMIT,
            service: 'program',
            operation: 'create',
            data: { current: 10, max: 10 },
        };
        vi.mocked(ruleEngine.check).mockResolvedValue(mockResult);

        const onResolved = vi.fn();

        renderHook(() =>
            useRuleCheck({ service: 'program', operation: 'create', onResolved })
        );

        await waitFor(() =>
        {
            expect(onResolved).toHaveBeenCalledWith(mockResult);
        });
    });
});