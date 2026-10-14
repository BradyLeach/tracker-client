/**
 * RemoveLocationAddressDialog
 *
 * Confirms and removes an address from a location. Only the relationship is deleted —
 * the address record itself is left in place.
 */

import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { useDeleteLocationAddress } from '../hooks/useDeleteLocationAddress';
import type { LocationAddress } from '../types/locationAddress.types';

export interface RemoveLocationAddressDialogProps
{
    open: boolean;
    onClose: () => void;
    locationAddress: LocationAddress | null;
    onRemoved?: ( locationAddress: LocationAddress ) => void;
}

export function RemoveLocationAddressDialog( { open, onClose, locationAddress, onRemoved }: RemoveLocationAddressDialogProps )
{
    const { t } = useTranslation();
    const deleteLocationAddress = useDeleteLocationAddress();

    const handleRemove = async () =>
    {
        if( !locationAddress ) return;

        await deleteLocationAddress.mutateAsync( locationAddress.id ).catch( () => undefined );

        onClose();

        if( !deleteLocationAddress.isError ) onRemoved?.( locationAddress );
    };

    const address = locationAddress?.address;
    const line = [address?.line1, address?.city, address?.postalCode].filter( Boolean ).join( ', ' );

    return (
        <MessageDialog
            open={open}
            onClose={onClose}
            title={t( 'pages.company.location.removeAddressConfirm.title' )}
            actions={
                <>
                    <Button onClick={onClose} variant="text">
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        onClick={handleRemove}
                        variant="contained"
                        color="error"
                        disabled={deleteLocationAddress.isPending}
                    >
                        {t( 'shared.buttons.remove' )}
                    </Button>
                </>
            }
        >
            <Typography>
                {t( 'pages.company.location.removeAddressConfirm.body', { address: line } )}
            </Typography>
        </MessageDialog>
    );
}

export default RemoveLocationAddressDialog;
