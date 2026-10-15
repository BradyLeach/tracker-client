/**
 * ConcludeExperimentDialog
 *
 * Concludes a running experiment with a decision — persevere, pivot or kill — and the
 * learning it leaves. The server records both in one transaction and freezes the
 * results, so the experiment page reads the snapshot from then on.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useConcludeExperiment } from '../hooks/useConcludeExperiment';
import { buildConclusionFormConfig } from '../config/buildConclusionFormConfig';
import type { Experiment, ExperimentDecision } from '../types/experiment.types';

const FORM_ID = 'conclude-experiment-form';

export interface ConcludeExperimentDialogProps
{
    open: boolean;
    onClose: () => void;
    experiment: Experiment | null;
    /** Called once the experiment is concluded, so the page can re-read its frozen results. */
    onConcluded?: () => void;
}

export function ConcludeExperimentDialog( { open, onClose, experiment, onConcluded }: ConcludeExperimentDialogProps )
{
    const { t } = useTranslation();
    const conclude = useConcludeExperiment();

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildConclusionFormConfig();

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        if( !experiment ) return;

        await conclude.mutateAsync( {
            id: experiment.id,
            decision: data['decision'] as ExperimentDecision,
            learning: String( data['learning'] ?? '' ).trim(),
        } );

        onConcluded?.();
        handleClose();
    };

    const handleClose = () =>
    {
        conclude.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( 'forms.conclusion.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={conclude.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        variant="contained"
                        form={FORM_ID}
                        type="submit"
                        disabled={conclude.isPending}
                    >
                        {conclude.isPending ? t( 'shared.interactions.saving' ) : t( 'forms.conclusion.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={conclude.error ? formatApiError( t, conclude.error ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={conclude.isPending}
                        formId={FORM_ID}
                        formScope="conclusion"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
