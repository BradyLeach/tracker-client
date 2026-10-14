/**
 * Rule Flow Integration Tests
 *
 * Tests complete rule flow from user action to UI outcome.
 * Does NOT test i18n strings - that's covered in resolveRuleMessage.test.ts
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RuleGate, useRuleCheck } from '@/core/businessRules';
import { RULE_CODES } from '@/core/businessRules/ruleCodes';
import { ruleRegistry } from '@/core/businessRules/RuleRegistry';
import type { RuleCheckResult } from '@/core/businessRules/types';

vi.mock('@/services/dataService/dataService', () => ({
    dataService: { getMetadata: vi.fn() }
}));

import { dataService } from '@/services/dataService/dataService';

describe('Rule Flow Integration', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();

        ruleRegistry.setBundle({
            region: {
                global: {
                    accountTypeLevel: {
                        0: {
                            program: {
                                operation: {
                                    create: { limit: { max: 5 } }
                                }
                            },
                            identity: {
                                operation: {
                                    access: { verification: { minAge: 18 } }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    describe('Resource Limit Flow', () =>
    {
        it('renders children when under limit', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 3 });

            render(
                <RuleGate service="program" operation="create">
                    <div data-testid="protected-content" />
                </RuleGate>
            );

            await waitFor(() =>
            {
                expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            });
        });

        it('hides children when at limit', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 5 });

            render(
                <RuleGate service="program" operation="create">
                    <div data-testid="protected-content" />
                </RuleGate>
            );

            await waitFor(() =>
            {
                expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            });
        });
    });

    describe('Age Verification Flow', () =>
    {
        it('hides content for underage user', async () =>
        {
            const userDob = new Date();
            userDob.setFullYear(userDob.getFullYear() - 16);

            render(
                <RuleGate service="identity" operation="access" context={{ userDob }}>
                    <div data-testid="age-restricted" />
                </RuleGate>
            );

            await waitFor(() =>
            {
                expect(screen.queryByTestId('age-restricted')).not.toBeInTheDocument();
            });
        });

        it('shows content for adult user', async () =>
        {
            const userDob = new Date();
            userDob.setFullYear(userDob.getFullYear() - 25);

            render(
                <RuleGate service="identity" operation="access" context={{ userDob }}>
                    <div data-testid="age-restricted" />
                </RuleGate>
            );

            await waitFor(() =>
            {
                expect(screen.getByTestId('age-restricted')).toBeInTheDocument();
            });
        });
    });

    describe('Hook Data Exposure', () =>
    {
        it('exposes result.data for parent threshold calculations', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 4 });

            function TestComponent()
            {
                const { result, isLoading } = useRuleCheck({
                    service: 'program',
                    operation: 'create'
                });

                if (isLoading) return <div data-testid="loading" />;

                const atWarningThreshold = (result?.data.limit.current / result?.data.limit.max) >= 0.8;

                return (
                    <>
                        {atWarningThreshold && <div data-testid="warning-feedback" />}
                        {result?.allowed && <div data-testid="form-content" />}
                    </>
                );
            }
            render(<TestComponent />);

            await waitFor(() =>
            {
                expect(screen.getByTestId('warning-feedback')).toBeInTheDocument();
                expect(screen.getByTestId('form-content')).toBeInTheDocument();
            });
        });
    });

    describe('Fail-Open Behavior', () =>
    {
        it('renders children when rule service fails', async () =>
        {
            vi.mocked(dataService.getMetadata).mockRejectedValue(new Error('Unavailable'));

            render(
                <RuleGate service="program" operation="create">
                    <div data-testid="protected-content" />
                </RuleGate>
            );

            await waitFor(() =>
            {
                expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            });
        });
    });

    describe('onResolved Callback', () =>
    {
        it('provides result with enforcer and data for parent UI logic', async () =>
        {
            vi.mocked(dataService.getMetadata).mockResolvedValue({ total: 5 });

            let capturedResult: RuleCheckResult | null = null;

            function TestComponent()
            {
                const [blocked, setBlocked] = React.useState(false);

                return (
                    <>
                        <RuleGate
                            service="program"
                            operation="create"
                            onResolved={(result) =>
                            {
                                capturedResult = result;
                                if (!result.allowed) setBlocked(true);
                            }}
                        >
                            <div data-testid="form-content" />
                        </RuleGate>
                        {blocked && <div data-testid="upgrade-prompt" />}
                    </>
                );
            }

            render(<TestComponent />);

            await waitFor(() =>
            {
                expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
            });

            // Add assertion that capturedResult was set
            expect(capturedResult).not.toBeNull();

            // Now TypeScript knows it's not null, but you still need the ! or cast
            expect(capturedResult!.enforcer).toBe(RULE_CODES.LIMIT);
            expect(capturedResult!.data).toMatchObject({ key: 'max', accountTypeLevel: 0, current: 5, max: 5 });
        });
    });
});