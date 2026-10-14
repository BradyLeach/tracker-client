/**
   * VerificationRulePlayground - Interactive Demo for Verification Rules
   *
   * Demonstrates age-based verification rule enforcement using the useRuleCheck
   * hook pattern. Unlike limit rules (which have warning thresholds), verification
   * rules are binary: either you meet the requirement or you don't.
   *
   * Test Scenarios:
   * 1. **Age 25 (Pass)**: User is over 18, verification allows access
   * 2. **Age 16 (Fail)**: User is under 18, verification blocks with MessageDialog
   *
   * Architecture Demonstrated:
   * - Layer 1: useRuleCheck hook - Calls verification.checker.tsx
   * - Layer 2: verification.checker.tsx - Compares userAge vs minAge using handlers
   * - Layer 3: resolveRuleMessage - Translates to i18n strings with specific='age'
   * - Layer 4: MessageDialog - Shows blocking error (no way to proceed)
   *
   * Key Differences from Limit Rules:
   * - No warning thresholds (binary allowed/blocked)
   * - Uses result.specific to identify which check failed ('age', 'email', 'identity')
   * - Typically blocks hard (no "proceed anyway" option)
   * - Data contains expected vs actual values for error messages
   *
   * Mock Behavior:
   * - Injects simulateRuleCheck into ruleEngine.check() on mount
   * - Returns VERIFICATION enforcer with specific='age'
   * - Compares userAge vs minAge (18) deterministically
   * - No backend calls - fully offline test-bed
   *
   * Real-World Use Cases:
   * - Age verification for compliance (COPPA, GDPR)
   * - Email verification before accessing features
   * - Identity verification for sensitive operations
   *
   * Useful for validating:
   * - Verification handler logic (age comparison)
   * - Message resolution with specific='age' parameter
   * - Hard blocking UI (no bypass options)
   * - useRuleCheck hook with binary results
   */
import i18n from '@/utils/i18n';
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Paper, Skeleton } from '@mui/material';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { ruleEngine } from '@/core/businessRules/RuleEngine';
import { useRuleCheck, type RuleCode } from '@/core/businessRules';
import { resolveRuleMessage, extractRuleParams } from '@/core/businessRules/resolveRuleMessage';
import { simulateRuleCheck } from './ruleMockHandlers';
import type { RuleContext } from './types';

/**
 * VerificationRulePlayground Component
 *
 * Interactive test-bed for age verification enforcement. Provides two buttons
 * that trigger rule checks with different ages to demonstrate:
 *
 * Success Path (age 25):
 * 1. Button clicked → setContext({ userAge: 25, minAge: 18 })
 * 2. Context changes → useRuleCheck re-runs automatically
 * 3. Mock returns { allowed: true, data: { minAge: 18, actualAge: 25 } }
 * 4. onResolved callback fires (but does nothing - no dialog for success)
 * 5. result.allowed = true → success message box renders
 *
 * Failure Path (age 16):
 * 1. Button clicked → setContext({ userAge: 16, minAge: 18 })
 * 2. Context changes → useRuleCheck re-runs
 * 3. Mock returns { allowed: false, enforcer: 'VERIFICATION', specific: 'age' }
 * 4. onResolved callback fires → calls resolveRuleMessage
 * 5. resolveRuleMessage looks up i18n key: rule.VERIFICATION.block.age
 * 6. Returns { title: 'Age Requirement Not Met', description: '...' }
 * 7. MessageDialog opens with blocking message
 *
 * Component State:
 * - context: RuleContext with userAge/minAge for mock to evaluate
 * - showDialog: Controls MessageDialog visibility (only on blocks)
 * - dialogMessage: Resolved i18n strings from resolveRuleMessage
 *
 * No Warning Threshold Logic:
 * Unlike LimitRulePlayground which shows warnings at 80%, this playground
 * has no intermediate states. Verification is binary: allowed or blocked.
 *
 * UI Flow:
 * - isLoading: Shows Skeleton while rule check runs
 * - result.allowed = true: Shows success box
 * - result.allowed = false: Shows MessageDialog via onResolved
 */
export function VerificationRulePlayground()
{
    const ruleScenario = 'verification';

    const [context, setContext] = useState<RuleContext | null>( null );
    const [showDialog, setShowDialog] = useState( false );
    const [dialogMessage, setDialogMessage] = useState<any | null>( null );

    /**
     * Rule check orchestration using useRuleCheck hook.
     *
     * Demonstrates VERIFICATION enforcer (age checks) using the hook pattern.
     *
     * Key Differences from LIMIT Enforcer:
     * - LIMIT: Gradual approach to limit (3/10, 8/10, 10/10) with warnings
     * - VERIFICATION: Binary pass/fail (age >= 18 or age < 18)
     * - LIMIT: Parent calculates thresholds (80% warning logic)
     * - VERIFICATION: No thresholds - enforcer decides allowed/blocked
     *
     * The result.data for verification contains:
     * - minAge: Required minimum age from rule (18)
     * - actualAge: User's actual age from context (25 or 16)
     * - specific: Which verification failed ('age' in this case)
     *
     * Why specific='age' matters:
     * - Enables targeted i18n lookup: rule.VERIFICATION.block.age
     * - Same enforcer handles email, identity, age with different messages
     * - Parent can show different UI based on what failed
     *
     * onResolved Callback:
     * - Only fires dialog for blocks (!result.allowed)
     * - Success cases render inline success box (no dialog needed)
     * - This pattern lets parent control UX: modal vs inline vs redirect
     *
     * Real-World Usage:
     * In production, context would come from user profile:
     * - userDob from /me endpoint → calculate age
     * - emailVerified from user.emailVerifiedAt field
     * - identityVerificationStatus from KYC service
     */
    const { result, isLoading } = useRuleCheck( {
        service: 'identity',
        operation: 'access',
        context: context || {},
        onResolved: ( result ) =>
        {
            if( !result.allowed )
            {
                setDialogMessage(
                    resolveRuleMessage(
                        result.enforcer as RuleCode,
                        'block',
                        result.service,
                        result.specific,
                        extractRuleParams( result )
                    )
                );
                setShowDialog( true );
            }
        }
    } );

    /**
     * Triggers a rule check with simulated age values.
     *
     * @param age - User's age to test (25 = pass, 16 = fail)
     */
    const runCheck = ( age: number ) =>
    {
        setContext( {
            currentCount: 0,
            maxCount: 0,
            userAge: age,
            minAge: 18,
        } );
        setShowDialog( false );
        setDialogMessage( null );
    };

    /**
     * Mock injection for deterministic verification testing
     *
     * Replaces ruleEngine.check() with simulateRuleCheck to return
     * predictable VERIFICATION results without backend calls.
     *
     * Mock Flow:
     * 1. Receives context with { userAge, minAge }
     * 2. Compares userAge < minAge (e.g., 16 < 18)
     * 3. Returns:
     *    - allowed: false if age check fails
     *    - enforcer: RULE_CODES.VERIFICATION
     *    - specific: 'age' (identifies which verification failed)
     *    - data: { minAge: 18, expected: 18, actual: 16 }
     *
     * Why Mock Instead of Real RuleEngine:
     * - No backend dependency (works offline)
     * - Deterministic results (same input = same output)
     * - Fast iteration (no network latency)
     * - Easy to test edge cases (age 17.9 vs 18.0)
     *
     * Real Implementation Difference:
     * - Real: Calls verification.checker.tsx → uses verificationHandlers
     * - Mock: Calls simulateRuleCheck → hardcoded logic
     * - Real: Fetches user DOB from context.userDob, calculates age with dayjs
     * - Mock: Takes userAge directly (pre-calculated)
     *
     * See ruleMockHandlers.ts handleVerificationScenario() for mock implementation.
     *
     * Cleanup on Unmount:
     * - Restores original ruleEngine.check to prevent mock pollution
     * - Critical for test isolation (other components use real engine)
     */
    useEffect( () =>
    {
        const original = ruleEngine.check;
        ruleEngine.check = async ( service, operation, context ) =>
            simulateRuleCheck( { scenario: ruleScenario, service, operation, context: context as RuleContext } );
        return () => void ( ruleEngine.check = original );
    }, [ruleScenario] );

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4">Verification Rule Test</Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Stack spacing={2}>
                    <Button variant="contained" onClick={() => runCheck( 25 )}>
                        Verify Over Age
                    </Button>

                    <Button variant="outlined" color="warning" onClick={() => runCheck( 16 )}>
                        Verify Under Age
                    </Button>

                    {
                        /* Loading state while rule check runs */
                        isLoading && <Skeleton variant="rectangular" height={100} />
                    }

                    {
                        /**
                         * Success message when verification passes
                         *
                         * Only shown when result.allowed = true (age >= 18).
                         *
                         * Accessibility:
                         * - role="alert": Announces to screen readers
                         * - aria-live="polite": Non-intrusive announcement
                         *
                         * Styling:
                         * - Uses theme.palette['success'] for colors
                         * - Light background, dark text, main border
                         * - Consistent with Material-UI design system
                         *
                         * Why Not a Dialog?
                         * - Success is positive, non-blocking
                         * - User can continue exploring playground
                         * - Failures use MessageDialog to grab attention
                         */
                        result?.allowed && (
                            <Box>
                                <Typography
                                    role="alert"
                                    aria-live="polite"
                                    variant="body2"
                                    sx={( theme ) =>
                                    {
                                        const palette = theme.palette['success'];
                                        return {
                                            p: 2,
                                            bgcolor: palette.light,
                                            color: palette.dark,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: palette.main,
                                        };
                                    }}
                                >
                                    Rule processed and all verification checks passed! 🤩🎉
                                </Typography>
                            </Box>
                        )
                    }
                </Stack>
            </Paper>

            {/* Context debug panel */}
            {context && (
                <Paper sx={{ mt: 4, p: 2 }}>
                    <Typography variant="subtitle2">Current Context</Typography>
                    <Typography component="pre" fontFamily="monospace" fontSize={13}>
                        {JSON.stringify( context, null, 2 )}
                    </Typography>
                </Paper>
            )}

            {
                /**
                 * Blocking dialog for verification failures
                 *
                 * Shown when result.allowed = false (age < 18).
                 *
                 * dialogMessage Shape (from resolveRuleMessage):
                 * {
                 *   key: 'rule.VERIFICATION.block.age',
                 *   title: 'Age Requirement Not Met',
                 *   description: 'You must be at least 18 years old to access...',
                 *   action: 'Learn More'
                 * }
                 *
                 * i18n Key Hierarchy:
                 * 1. rule.VERIFICATION.block.identity.age (most specific)
                 * 2. rule.VERIFICATION.block.age
                 * 3. rule.VERIFICATION.block
                 * 4. rule.VERIFICATION.generic
                 * 5. rule.generic (ultimate fallback)
                 *
                 * Why MessageDialog vs Inline Error?
                 * - Hard block (no way to proceed)
                 * - Focuses user attention
                 * - Can include CTAs (upgrade, verify email, etc.)
                 *
                 * Action Button:
                 * - Currently just closes dialog (playground demo)
                 * - Real app: "Verify Email", "Update DOB", "Contact Support"
                 */
            }
            <MessageDialog
                open={showDialog}
                onClose={() => setShowDialog( false )}
                title={dialogMessage?.title || 'Access Denied'}
                actions={
                    <Button onClick={() => setShowDialog( false )} autoFocus>
                        {i18n.t( 'shared.buttons.close' )}
                    </Button>
                }
            >
                <Typography>{dialogMessage?.description}</Typography>
            </MessageDialog>
        </Box>
    );
}
