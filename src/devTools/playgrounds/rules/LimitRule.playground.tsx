/**
 * LimitRulePlayground - Interactive Demo for Resource Limit Rules
 *
 * Demonstrates the complete flow of limit-based rule enforcement using the
 * useRuleCheck hook pattern. This playground allows developers to test three
 * scenarios with deterministic, mocked rule results:
 *
 * 1. **Low usage (3/10)**: Rule allows operation, no warnings shown
 * 2. **High usage (8/10)**: Rule allows but shows warning at 80% threshold
 * 3. **At limit (10/10)**: Rule blocks operation, shows upgrade dialog
 *
 * Architecture Demonstrated:
 * - Layer 1: useRuleCheck hook - Pure orchestration, exposes result.data
 * - Layer 2: Parent component - Calculates thresholds (80% warning logic)
 * - Layer 3: resolveRuleMessage - Translates RuleCheckResult to i18n strings
 * - Layer 4: UI components - FormScaffold.Feedback for warnings, MessageDialog for blocks
 *
 * Key Pattern: The hook exposes result.data directly, enabling parent to implement
 * custom logic like "show warning when usage >= 80%" without the hook knowing about
 * UI thresholds. This is the core benefit of the hook/gate split.
 *
 * Mock Behavior:
 * - Injects simulateRuleCheck into ruleEngine.check() on mount
 * - Returns deterministic results based on currentCount/maxCount
 * - No backend calls - fully offline test-bed
 *
 * Useful for validating:
 * - Rule DSL evaluation (limit enforcer logic)
 * - Message resolution (hierarchical i18n key lookup)
 * - Threshold-based UI decisions (parent calculates 80% warning)
 * - Form rendering triggers (conditional FormScaffold display)
 * - useRuleCheck hook integration
 */

import i18n from '@/utils/i18n';
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Paper, Skeleton } from '@mui/material';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { ruleEngine } from '@/core/businessRules/RuleEngine';
import { useRuleCheck, type RuleCode } from '@/core/businessRules';
import { resolveRuleMessage, extractRuleParams } from '@/core/businessRules/resolveRuleMessage';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import type { FormConfig } from '@/components/forms/types/formConfig.types';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { simulateRuleCheck } from './ruleMockHandlers';
import type { RuleContext } from './types';

export function LimitRulePlayground()
{
    const ruleScenario = 'limit';

    const [context, setContext] = useState<RuleContext | null>( null );
    const [showDialog, setShowDialog] = useState( false );
    const [dialogMessage, setDialogMessage] = useState<any | null>( null );

    /**
     * Rule check orchestration using useRuleCheck hook.
     *
     * This demonstrates the hook-first pattern where:
     * 1. Hook calls RuleEngine.check() when context changes
     * 2. Returns { result, isLoading } for parent to consume
     * 3. Fires onResolved callback with full RuleCheckResult
     *
     * Why hook instead of component?
     * - Direct access to result.data for threshold calculations (line 133)
     * - Parent owns ALL UI decisions (warning vs error vs modal)
     * - No need for workarounds like hoisting state via callbacks
     *
     * The result.data contains:
     * - current: number of resources user has created
     * - max: maximum allowed for their tier
     * - (This data drives the 80% warning logic below)
     */
    const { result, isLoading } = useRuleCheck( {
        service: 'program',
        operation: 'create',
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
     * Triggers a rule check with simulated current/max values.
     * @param currentCount - Current resource count
     * @param maxCount - Max allowed resources
     */
    const runCheck = ( currentCount: number, maxCount: number ) =>
    {
        setContext( {
            currentCount,
            maxCount,
            userAge: 0,
            minAge: 0,
        } );
        setShowDialog( false );
        setDialogMessage( null );
    };

    /**
     * Mock injection for deterministic testing
     *
     * Replaces ruleEngine.check() with simulateRuleCheck to return
     * predictable results without backend calls.
     *
     * Flow:
     * 1. Save original ruleEngine.check function
     * 2. Override with mock that calls simulateRuleCheck()
     * 3. Mock returns based on scenario + currentCount/maxCount
     * 4. Restore original on unmount (cleanup function)
     *
     * This allows offline testing of:
     * - Low usage scenarios (allowed, no warning)
     * - High usage scenarios (allowed, shows warning)
     * - Limit reached scenarios (blocked, shows modal)
     *
     * See ruleMockHandlers.ts for mock implementation details.
     */
    useEffect( () =>
    {
        const original = ruleEngine.check;
        ruleEngine.check = async ( service, operation, context ) =>
            simulateRuleCheck( { scenario: ruleScenario, service, operation, context: context as RuleContext } );
        return () => void ( ruleEngine.check = original );
    }, [ruleScenario] );

    /**
     * A basic single-field form config for triggering the rule guard.
     */
    const formConfig: FormConfig = {
        groups: [
            {
                type: 'fields',
                title: '',
                fields: [
                    {
                        name: 'programName',
                        type: 'text',
                        label: { text: 'Program Name' },
                        placeholder: 'Enter program name',
                        required: true,
                    },
                ],
            },
        ],
    };

    return (
        <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h4">Limit Rule Test</Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Stack spacing={2}>
                    <Button variant="contained" onClick={() => runCheck( 3, 10 )}>
                        Create (low usage – allowed)
                    </Button>

                    <Button variant="outlined" color="warning" onClick={() => runCheck( 8, 10 )}>
                        Create (high usage – warning)
                    </Button>

                    <Button variant="outlined" color="error" onClick={() => runCheck( 10, 10 )}>
                        Create (at limit – blocked)
                    </Button>

                    {isLoading && <Skeleton variant="rectangular" height={200} />}
                    {result?.allowed && context && (
                        <FormScaffold>
                            <FormScaffold.Header
                                title="Create Program"
                                subtitle="Limit check passed"
                            />
                            {
                                /**
                                 * Warning threshold: Show feedback when usage >= 80%
                                 *
                                 * This demonstrates parent-controlled UI logic. The useRuleCheck hook
                                 * returns result.data with {current, max}, allowing the parent to
                                 * calculate thresholds and decide when to show warnings.
                                 *
                                 * Example: 8/10 = 80% → shows "You're using 8 of 10 program slots"
                                 *
                                 * This pattern enables:
                                 * - Different thresholds per service (program: 80%, participant: 90%)
                                 * - Progressive warnings (yellow at 80%, orange at 95%)
                                 * - Custom messaging based on tier or region
                                 *
                                 * The hook doesn't know about "80%" - that's business logic owned by
                                 * the parent component.
                                 */
                                ( context.currentCount / context.maxCount >= 0.8 ) && (
                                    <FormScaffold.Feedback
                                        severity="warning"
                                        message={`You're using ${context.currentCount} of ${context.maxCount} program slots.`}
                                    />
                                )}

                            <FormScaffold.Body>
                                <BaseFormRenderer
                                    config={formConfig}
                                    onSubmit={( data ) =>
                                    {
                                        console.log( 'Form submitted', data );
                                    }}
                                    loading={false}
                                    formId="limit-form"
                                />
                            </FormScaffold.Body>

                            <FormScaffold.Actions>
                                <Button type="submit" form="limit-form" fullWidth variant="contained">
                                    Create Program
                                </Button>
                            </FormScaffold.Actions>
                        </FormScaffold>
                    )}
                </Stack>
            </Paper>

            {/* Context debug */}
            {context && (
                <Paper sx={{ mt: 4, p: 2 }}>
                    <Typography variant="subtitle2">Current Context</Typography>
                    <Typography component="pre" fontFamily="monospace" fontSize={13}>
                        {JSON.stringify( context, null, 2 )}
                    </Typography>
                </Paper>
            )}

            {/* Dialog for blocked */}
            <MessageDialog
                open={showDialog}
                onClose={() => setShowDialog( false )}
                title={dialogMessage?.title || 'Limit Reached'}
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
