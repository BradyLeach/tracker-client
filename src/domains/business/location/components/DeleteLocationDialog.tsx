/**
 * DeleteLocationDialog
 *
 * Confirms and runs a hard delete on a location. Location has no soft delete,
 * so the confirmation makes clear that the action cannot be undone.
 */

import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { useDeleteLocation } from '../hooks/useDeleteLocation';
import type { Location } from '../types/location.types';

export interface DeleteLocationDialogProps
{
    open: boolean;
    onClose: () => void;
    location: Location | null;
    onDeleted?: ( location: Location ) => void;
}

export function DeleteLocationDialog( { open, onClose, location, onDeleted }: DeleteLocationDialogProps )
{
    const { t } = useTranslation();
    const deleteLocation = useDeleteLocation();

    const handleDelete = async () =>
    {
        if( !location ) return;

        await deleteLocation.mutateAsync( location.id ).catch( () => undefined );

        onClose();

        if( !deleteLocation.isError ) onDeleted?.( location );
    };

    return (
        <MessageDialog
            open={open}
            onClose={onClose}
            title={t( 'pages.company.location.deleteConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text">
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={deleteLocation.isPending}
                    >
                        {t( 'shared.buttons.delete' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {t( 'pages.company.location.deleteConfirm.body', { name: location?.label ?? '' } )}
            </Typography>
        </MessageDialog>
    );
}

export default DeleteLocationDialog;
