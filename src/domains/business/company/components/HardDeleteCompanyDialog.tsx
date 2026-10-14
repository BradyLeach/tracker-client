/**
 * HardDeleteCompanyDialog
 *
 * Confirms and runs a permanent delete — one company from its card, or every company
 * currently in trash from Empty Trash. Same dialog either way, because the warning is the
 * same warning; only the subject and the count in the body text change.
 *
 * There is no bulk hard-delete endpoint, and this does not invent one client-side by firing
 * requests in parallel — it awaits each one before starting the next, the same way a user
 * clicking N times would produce N round trips. Slower, and honest about what is happening.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export interface HardDeleteCompanyDialogProps
{
    open: boolean;
    onClose: () => void;
    /** One company for a per-card delete, or every company in trash for Empty Trash. */
    companies: Company[];
    /** Called with the ids that were actually deleted, once every request has settled. */
    onDeleted?: ( deletedIds: string[] ) => void;
}

export function HardDeleteCompanyDialog( { open, onClose, companies, onDeleted }: HardDeleteCompanyDialogProps )
{
    const { t } = useTranslation();

    const [isPending, setIsPending] = useState( false );
    const [completed, setCompleted] = useState( 0 );

    const isBulk = companies.length > 1;

    const handleDelete = async () =>
    {
        setIsPending( true );
        setCompleted( 0 );

        const deletedIds: string[] = [];

        // Sequential on purpose — one round trip per record, the same cost a user clicking
        // delete N times would pay. Continuing past a single failure so one bad record does
        // not strand the rest of an Empty Trash run.
        for( const company of companies )
        {
            const response = await companyService.hardDelete( company.id );

            if( !response.error ) deletedIds.push( company.id );

            setCompleted( previous => previous + 1 );
        }

        setIsPending( false );
        onClose();
        onDeleted?.( deletedIds );
    };

    return (
        <MessageDialog
            open={open}
            onClose={isPending ? () => undefined : onClose}
            title={t( 'pages.company.hardDeleteConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text" disabled={isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={isPending}
                    >
                        {isPending
                            ? t( 'pages.company.hardDeleteConfirm.progress', { completed, total: companies.length } )
                            : t( 'shared.buttons.deletePermanently' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {isBulk
                    ? t( 'pages.company.hardDeleteConfirm.bodyBulk', { count: companies.length } )
                    : t( 'pages.company.hardDeleteConfirm.body', { name: companies[0]?.name ?? '' } )}
            </Typography>
        </MessageDialog>
    );
}

export default HardDeleteCompanyDialog;
