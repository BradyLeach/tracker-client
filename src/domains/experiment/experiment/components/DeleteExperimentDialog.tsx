/**
 * DeleteExperimentDialog
 *
 * Confirms and runs an experiment delete. Shared by the collection's panel menu and the
 * experiment page, so each trigger does not grow its own copy of the same confirm +
 * mutate + close sequence.
 */

import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { useDeleteExperiment } from '../hooks/useDeleteExperiment';
import type { Experiment } from '../types/experiment.types';

export interface DeleteExperimentDialogProps
{
    open: boolean;
    onClose: () => void;
    experiment: Experiment | null;
    /** Called after a successful delete. The experiment page navigates away; a list just closes. */
    onDeleted?: ( experiment: Experiment ) => void;
}

export function DeleteExperimentDialog( { open, onClose, experiment, onDeleted }: DeleteExperimentDialogProps )
{
    const { t } = useTranslation();
    const deleteExperiment = useDeleteExperiment();

    const handleDelete = async () =>
    {
        if( !experiment ) return;

        await deleteExperiment.mutateAsync( experiment.id ).catch( () => undefined );

        onClose();

        if( !deleteExperiment.isError ) onDeleted?.( experiment );
    };

    return (
        <MessageDialog
            open={open}
            onClose={onClose}
            title={t( 'pages.experiment.deleteConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text">
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={deleteExperiment.isPending}
                    >
                        {t( 'shared.buttons.delete' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {t( 'pages.experiment.deleteConfirm.body', { title: experiment?.title ?? '' } )}
            </Typography>
        </MessageDialog>
    );
}
