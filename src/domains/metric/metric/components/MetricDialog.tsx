/**
 * MetricDialog
 *
 * Creates a metric, or edits one. Pass `metric` to open in edit mode; omit for create.
 *
 * A metric reads one measurement of one source, so the source is chosen above the form
 * and the form is rebuilt for it: its measurement names and dimension keys become the
 * choices, and the filters below may reference only its dimensions.
 *
 * The server holds the rules — a unique count needs a dimension to count, filters only
 * on dimensions the source allows — and its error key shows in the form's feedback slot.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, MenuItem, Select, Typography } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useMeasurementSources } from '@/domains/measurement';
import { useCreateMetric } from '../hooks/useCreateMetric';
import { useUpdateMetric } from '../hooks/useUpdateMetric';
import { buildMetricFormConfig } from '../config/buildMetricFormConfig';
import { DimensionFilterEditor } from './DimensionFilterEditor';
import type { DimensionFilter, Metric, MetricAggregation } from '../types/metric.types';

const FORM_ID = 'metric-form';

export interface MetricDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing metric to edit it. */
    metric?: Metric | null;
    /** Called with the new metric's id once it is created. */
    onCreated?: ( metricId: string ) => void;
}

/** A blank number arrives as ''; no window means all time. */
function optionalNumber( value: unknown ): number | null
{
    if( value === '' || value === null || value === undefined ) return null;
    const parsed = Number( value );
    return Number.isFinite( parsed ) ? parsed : null;
}

export function MetricDialog( { open, onClose, metric, onCreated }: MetricDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!metric;
    const createMutation = useCreateMetric();
    const updateMutation = useUpdateMetric( metric?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: sources = [] } = useMeasurementSources();

    const [sourceId, setSourceId] = useState( '' );
    const [filters, setFilters] = useState<DimensionFilter[]>( [] );

    /** Remounts the renderer and re-seeds the choice, so a reopened dialog starts from the record. */
    const [formKey, setFormKey] = useState( 0 );
    useEffect( () =>
    {
        if( !open ) return;
        setFormKey( key => key + 1 );
        setSourceId( metric?.measurementSourceId ?? '' );
        setFilters( metric?.filters ?? [] );
    }, [open, metric] );

    const source = sources.find( candidate => candidate.id === sourceId );

    const config = useMemo(
        () => source ? buildMetricFormConfig( source, metric?.measurementSourceId === source.id ? metric : undefined ) : undefined,
        [source, metric],
    );

    // A different source is a different set of measurements and dimensions.
    const chooseSource = ( next: string ) =>
    {
        setSourceId( next );
        setFilters( [] );
        setFormKey( key => key + 1 );
    };

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const aggregation = data['aggregation'] as MetricAggregation;

        // Sent as the server stores it: a cleared optional value is null, not absent.
        const values: Record<string, unknown> = {
            ...( isEdit ? {} : { key: String( data['key'] ?? '' ).trim() } ),
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : null,
            measurementSourceId: sourceId,
            measurementName: String( data['measurementName'] ?? '' ),
            aggregation,
            // Only a unique count names a dimension; the server refuses one anywhere else.
            uniqueDimensionKey: aggregation === 'unique' ? String( data['uniqueDimensionKey'] ?? '' ) : null,
            windowDays: optionalNumber( data['windowDays'] ),
            filters,
        };
        const payload = values as Partial<Metric>;

        if( isEdit )
        {
            await updateMutation.mutateAsync( payload );
        }
        else
        {
            const created = await createMutation.mutateAsync( payload );
            onCreated?.( created.id );
        }

        handleClose();
    };

    const handleClose = () =>
    {
        createMutation.reset();
        updateMutation.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            title={t( isEdit ? 'forms.metric.editTitle' : 'forms.metric.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        variant="contained"
                        form={FORM_ID}
                        type="submit"
                        disabled={mutation.isPending || !source}
                    >
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.metric.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? formatApiError( t, mutation.error ) : undefined} />
                <FormScaffold.Message>
                    <Typography variant="subtitle2" gutterBottom>{t( 'forms.metric.fields.measurementSourceId' )}</Typography>
                    <Select
                        size="small"
                        fullWidth
                        displayEmpty
                        value={sourceId}
                        disabled={mutation.isPending}
                        onChange={event => chooseSource( String( event.target.value ) )}
                    >
                        <MenuItem value="" disabled>{t( 'forms.metric.fields.measurementSourceIdPlaceholder' )}</MenuItem>
                        {sources.map( option => (
                            <MenuItem key={option.id} value={option.id}>{option.label ?? option.key}</MenuItem>
                        ) )}
                    </Select>
                </FormScaffold.Message>
                {source && config && (
                    <FormScaffold.Body>
                        <BaseFormRenderer
                            key={formKey}
                            config={config}
                            onSubmit={handleSubmit}
                            loading={mutation.isPending}
                            formId={FORM_ID}
                            formScope="metric"
                        />
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2">{t( 'forms.metric.filtersTitle' )}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                {t( 'forms.metric.filtersSubtitle' )}
                            </Typography>
                            <DimensionFilterEditor
                                value={filters}
                                onChange={setFilters}
                                allowedDimensionKeys={source.allowedDimensionKeys}
                                disabled={mutation.isPending}
                            />
                        </Box>
                    </FormScaffold.Body>
                )}
            </FormScaffold>
        </Dialog>
    );
}
