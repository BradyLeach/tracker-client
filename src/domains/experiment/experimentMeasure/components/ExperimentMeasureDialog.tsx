/**
 * ExperimentMeasureDialog
 *
 * Adds a measure to an experiment, or edits one. Pass `measure` to open in edit mode;
 * omit for create.
 *
 * What a measure needs depends on what it measures, so the type — and for a calculator
 * the calculator — is chosen above the form, and the form is rebuilt for that choice:
 * a metric, a formula, or one metric per calculator input. Calculators and their inputs
 * come from the registry; nothing here lists them.
 *
 * The server holds the rules — one primary per experiment, a primary calculator must
 * produce a single value, changes only while the experiment is a draft — and its error
 * key shows in the form's feedback slot.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, MenuItem, Select, Typography } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { useCalculators } from '@/domains/calculator';
import { useFormulas, useMetrics } from '@/domains/metric';
import { useCreateExperimentMeasure } from '../hooks/useCreateExperimentMeasure';
import { useUpdateExperimentMeasure } from '../hooks/useUpdateExperimentMeasure';
import { buildExperimentMeasureFormConfig } from '../config/buildExperimentMeasureFormConfig';
import type { ExperimentMeasure, MeasureType } from '../types/experimentMeasure.types';

const FORM_ID = 'experiment-measure-form';

const MEASURE_TYPES: MeasureType[] = ['metric', 'formula', 'calculator'];

export interface ExperimentMeasureDialogProps
{
    open: boolean;
    onClose: () => void;
    experimentId: string;
    /** Pass an existing measure to edit it. */
    measure?: ExperimentMeasure | null;
}

/** A blank select arrives as ''; an unbound optional input is left out rather than sent empty. */
function boundInputs( value: unknown ): Record<string, string>
{
    if( !value || typeof value !== 'object' ) return {};

    return Object.fromEntries(
        Object.entries( value as Record<string, unknown> ).filter( ( [, metricId] ) => typeof metricId === 'string' && metricId ),
    ) as Record<string, string>;
}

export function ExperimentMeasureDialog( { open, onClose, experimentId, measure }: ExperimentMeasureDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!measure;
    const createMutation = useCreateExperimentMeasure();
    const updateMutation = useUpdateExperimentMeasure( measure?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: metrics = [] } = useMetrics();
    const { data: formulas = [] } = useFormulas();
    const { data: calculators = [] } = useCalculators();

    const [measureType, setMeasureType] = useState<MeasureType>( 'metric' );
    const [calculatorKey, setCalculatorKey] = useState<string>( '' );

    /** Remounts the renderer and re-seeds the choice, so a reopened dialog starts from the record. */
    const [formKey, setFormKey] = useState( 0 );
    useEffect( () =>
    {
        if( !open ) return;
        setFormKey( key => key + 1 );
        setMeasureType( measure?.measureType ?? 'metric' );
        setCalculatorKey( measure?.calculatorKey ?? '' );
    }, [open, measure] );

    const calculator = calculators.find( descriptor => descriptor.key === calculatorKey );

    const config = useMemo(
        () => buildExperimentMeasureFormConfig( {
            measureType,
            metrics,
            formulas,
            calculator,
            // Defaults only apply to the type the measure already has.
            defaults: measure?.measureType === measureType ? measure : undefined,
        } ),
        [measureType, metrics, formulas, calculator, measure],
    );

    // A changed choice is a different form.
    const chooseType = ( next: MeasureType ) =>
    {
        setMeasureType( next );
        setFormKey( key => key + 1 );
    };

    const chooseCalculator = ( next: string ) =>
    {
        setCalculatorKey( next );
        setFormKey( key => key + 1 );
    };

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const payload: Partial<ExperimentMeasure> = {
            measureType,
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : undefined,
            isPrimary: data['isPrimary'] === true,
            metricId: measureType === 'metric' ? String( data['metricId'] ?? '' ) : undefined,
            formulaId: measureType === 'formula' ? String( data['formulaId'] ?? '' ) : undefined,
            calculatorKey: measureType === 'calculator' ? calculatorKey : undefined,
            calculatorInputs: measureType === 'calculator' ? boundInputs( data['calculatorInputs'] ) : undefined,
        };

        if( isEdit ) await updateMutation.mutateAsync( payload );
        else await createMutation.mutateAsync( { ...payload, experimentId } );

        handleClose();
    };

    const handleClose = () =>
    {
        createMutation.reset();
        updateMutation.reset();
        onClose();
    };

    const canSubmit = measureType !== 'calculator' || !!calculator;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( 'forms.experimentMeasure.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        variant="contained"
                        form={FORM_ID}
                        type="submit"
                        disabled={mutation.isPending || !canSubmit}
                    >
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.experimentMeasure.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? t( mutation.error.key ) : undefined} />
                <FormScaffold.Message>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                {t( 'forms.experimentMeasure.fields.measureType' )}
                            </Typography>
                            <Select
                                size="small"
                                fullWidth
                                value={measureType}
                                disabled={mutation.isPending}
                                onChange={event => chooseType( event.target.value as MeasureType )}
                            >
                                {MEASURE_TYPES.map( type => (
                                    <MenuItem key={type} value={type}>{t( `forms.experimentMeasure.options.${type}` )}</MenuItem>
                                ) )}
                            </Select>
                        </Box>

                        {measureType === 'calculator' && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    {t( 'forms.experimentMeasure.fields.calculatorKey' )}
                                </Typography>
                                <Select
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    value={calculatorKey}
                                    disabled={mutation.isPending}
                                    onChange={event => chooseCalculator( String( event.target.value ) )}
                                >
                                    <MenuItem value="" disabled>
                                        {t( 'forms.experimentMeasure.fields.calculatorKeyPlaceholder' )}
                                    </MenuItem>
                                    {calculators.map( descriptor => (
                                        <MenuItem key={descriptor.key} value={descriptor.key}>
                                            {t( `calculators.names.${descriptor.key}` )}
                                        </MenuItem>
                                    ) )}
                                </Select>
                                {calculator && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {t( 'forms.experimentMeasure.inputsSubtitle' )}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </FormScaffold.Message>
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={mutation.isPending}
                        formId={FORM_ID}
                        formScope="experimentMeasure"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
