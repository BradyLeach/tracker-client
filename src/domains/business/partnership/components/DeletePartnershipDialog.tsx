/**
 * DeletePartnershipDialog
 *
 * Confirms and runs a hard delete on a partnership. Partnership has no soft delete,
 * so the confirmation makes clear that the action cannot be undone.
 */

import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { useDeletePartnership } from '../hooks/useDeletePartnership';
import type { Partnership } from '../types/partnership.types';

export interface DeletePartnershipDialogProps
{
    open: boolean;
    onClose: () => void;
    partnership: Partnership | null;
    onDeleted?: ( partnership: Partnership ) => void;
}

export function DeletePartnershipDialog( { open, onClose, partnership, onDeleted }: DeletePartnershipDialogProps )
{
    const { t } = useTranslation();
    const deletePartnership = useDeletePartnership();

    const handleDelete = async () =>
    {
        if( !partnership ) return;

        await deletePartnership.mutateAsync( partnership.id ).catch( () => undefined );

        onClose();

        if( !deletePartnership.isError ) onDeleted?.( partnership );
    };

    return (
        <MessageDialog
            open={open}
            onClose={onClose}
            title={t( 'pages.company.partner.deleteConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text">
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={deletePartnership.isPending}
                    >
                        {t( 'shared.buttons.delete' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {t( 'pages.company.partner.deleteConfirm.body', { name: partnership?.contactName ?? '' } )}
            </Typography>
        </MessageDialog>
    );
}

export default DeletePartnershipDialog;
