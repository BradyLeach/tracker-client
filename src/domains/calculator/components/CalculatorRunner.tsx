/**
 * CalculatorRunner
 *
 * Runs one calculator standalone: its inputs as a form built from the registry
 * descriptor, and the result beneath it. The server does the maths; this collects the
 * values and presents what comes back in the units the descriptor names.
 *
 * Remount with a `key` per calculator, so a different calculator starts with a fresh form
 * and no stale result.
 */

import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useRunCalculator } from '../hooks/useRunCalculator';
import { buildCalculatorFormConfig } from '../config/buildCalculatorFormConfig';
import { describeResult } from '../orchestrators/calculators.orchestrator';
import type { CalculatorDescriptor } from '../types/calculator.types';

export interface CalculatorRunnerProps
{
    descriptor: CalculatorDescriptor;
}

/** A blank optional input is left out, so the calculator applies its own default. */
function withBlanksOmitted( data: Record<string, unknown> ): Record<string, unknown>
{
    return Object.fromEntries(
        Object.entries( data ).filter( ( [, value] ) => value !== '' && value !== null && value !== undefined ),
    );
}

export function CalculatorRunner( { descriptor }: CalculatorRunnerProps )
{
    const { t } = useTranslation();
    const run = useRunCalculator();

    const formId = `calculator-${descriptor.key}`;
    const config = buildCalculatorFormConfig( descriptor );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        await run.mutateAsync( { key: descriptor.key, values: withBlanksOmitted( data ) } ).catch( () => undefined );
    };

    const lines = run.data ? describeResult( descriptor, run.data ) : [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormScaffold>
                <FormScaffold.Feedback message={run.error ? formatApiError( t, run.error ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        config={config}
                        onSubmit={handleSubmit}
                        loading={run.isPending}
                        formId={formId}
                        formScope="calculator"
                    />
                </FormScaffold.Body>
            </FormScaffold>

            <Box>
                <Button variant="contained" type="submit" form={formId} disabled={run.isPending}>
                    {t( 'pages.calculators.runButton' )}
                </Button>
            </Box>

            {lines.length > 0 && (
                <Box
                    role="status"
                    sx={{
                        p: 2, border: '1px solid', borderColor: 'border.base', borderRadius: 1,
                        backgroundColor: 'background.default',
                    }}
                >
                    <Typography variant="overline" color="text.secondary">{t( 'pages.calculators.result' )}</Typography>
                    {lines.map( ( line, index ) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            {line.label && <Typography variant="body2" color="text.secondary">{line.label}</Typography>}
                            <Typography variant={line.label ? 'body1' : 'h4'}>{line.value}</Typography>
                        </Box>
                    ) )}
                </Box>
            )}
        </Box>
    );
}
