/**
 * DeleteCompanyDialog
 *
 * Confirms and runs a company delete. Extracted from the profile page so the trigger point
 * — profile header menu, live-list card, wherever the next one turns out to be — does not
 * each grow its own copy of the same confirm + mutate + close sequence.
 */

import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { useDeleteCompany } from '../hooks/useDeleteCompany';
import type { Company } from '../types/company.types';

export interface DeleteCompanyDialogProps
{
    open: boolean;
    onClose: () => void;
    company: Company | null;
    /** Called after a successful delete. A profile page navigates away; a list just closes. */
    onDeleted?: ( company: Company ) => void;
}

export function DeleteCompanyDialog( { open, onClose, company, onDeleted }: DeleteCompanyDialogProps )
{
    const { t } = useTranslation();
    const deleteCompany = useDeleteCompany();

    const handleDelete = async () =>
    {
        if( !company ) return;

        await deleteCompany.mutateAsync( company.id ).catch( () => undefined );

        onClose();

        if( !deleteCompany.isError ) onDeleted?.( company );
    };

    return (
        <MessageDialog
            open={open}
            onClose={onClose}
            title={t( 'pages.company.deleteConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text">
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={deleteCompany.isPending}
                    >
                        {t( 'shared.buttons.delete' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {t( 'pages.company.deleteConfirm.body', { name: company?.name ?? '' } )}
            </Typography>
        </MessageDialog>
    );
}

export default DeleteCompanyDialog;
