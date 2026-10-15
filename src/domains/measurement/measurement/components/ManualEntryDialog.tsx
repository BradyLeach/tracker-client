/**
 * ManualEntryDialog
 *
 * Enters measurements by hand into one source — for offline channels and anything else no
 * tool reports. Each submit writes one measurement through the same ingest path as every
 * other source, so the server applies the source's allowed sets the same way.
 *
 * Entering a backlog is a batch job, so the user can keep the dialog open between entries
 * rather than reopening it for each one.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, Dialog, FormControlLabel } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useIngestMeasurements } from '../hooks/useIngestMeasurements';
import { buildManualEntryFormConfig } from '../config/buildManualEntryFormConfig';
import type { IngestMeasurement } from '../types/measurement.types';
import type { MeasurementSource } from '../../measurementSource/types/measurementSource.types';

const FORM_ID = 'manual-entry-form';

export interface ManualEntryDialogProps
{
    open: boolean;
    onClose: () => void;
    source: MeasurementSource | null;
}

/** Only the dimensions given a value are sent; a blank one is not a dimension. */
function filledDimensions( value: unknown ): Record<string, string> | undefined
{
    if( !value || typeof value !== 'object' ) return undefined;

    const entries = Object.entries( value as Record<string, unknown> )
        .filter( ( [, dimension] ) => typeof dimension === 'string' && dimension.trim() )
        .map( ( [key, dimension] ) => [key, String( dimension ).trim()] );

    return entries.length ? Object.fromEntries( entries ) : undefined;
}

export function ManualEntryDialog( { open, onClose, source }: ManualEntryDialogProps )
{
    const { t } = useTranslation();
    const ingest = useIngestMeasurements();

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const [enterAnother, setEnterAnother] = useState( false );

    if( !source ) return null;

    const config = buildManualEntryFormConfig( source );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const value = data['value'] === '' || data['value'] == null ? undefined : Number( data['value'] );
        const campaignKey = typeof data['campaignKey'] === 'string' && data['campaignKey'].trim()
            ? data['campaignKey'].trim()
            : undefined;

        const measurement: IngestMeasurement = {
            name: String( data['name'] ?? '' ),
            occurredAt: new Date( String( data['occurredAt'] ) ).toISOString(),
            value,
            campaignKey,
            dimensions: filledDimensions( data['dimensions'] ),
        };

        await ingest.mutateAsync( { measurementSourceId: source.id, measurements: [measurement] } );

        if( enterAnother )
        {
            ingest.reset();
            setFormKey( key => key + 1 );
            return;
        }

        handleClose();
    };

    const handleClose = () =>
    {
        ingest.reset();
        setEnterAnother( false );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( 'forms.manualEntry.title' )}
            actions={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={enterAnother}
                                onChange={event => setEnterAnother( event.target.checked )}
                            />
                        }
                        label={t( 'forms.manualEntry.enterAnother' )}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleClose} disabled={ingest.isPending}>
                            {t( 'shared.buttons.cancel' )}
                        </Button>
                        <Button variant="contained" form={FORM_ID} type="submit" disabled={ingest.isPending}>
                            {ingest.isPending ? t( 'shared.interactions.saving' ) : t( 'forms.manualEntry.submitButton' )}
                        </Button>
                    </Box>
                </Box>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={ingest.error ? formatApiError( t, ingest.error ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={ingest.isPending}
                        formId={FORM_ID}
                        formScope="manualEntry"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
