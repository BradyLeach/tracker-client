/**
 * LocationAddressDialog
 *
 * Self-contained dialog for adding or editing one address of a location.
 * Pass `locationAddress` to open in edit mode; omit for create mode.
 *
 * Presents the address type and the address as one form. An address is never edited in
 * place: changed address fields create a new address and repoint the relationship.
 * Removing deletes the relationship only — the address record is left in place.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Box, IconButton, Menu, MenuItem } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { useCountries } from '@/domains/system';
import { useCreateAddress, buildAddressFormConfig } from '../../address';
import type { Address } from '../../address';
import { useCreateLocationAddress } from '../hooks/useCreateLocationAddress';
import { useUpdateLocationAddress } from '../hooks/useUpdateLocationAddress';
import { buildLocationAddressFormConfig } from '../config/buildLocationAddressFormConfig';
import { RemoveLocationAddressDialog } from './RemoveLocationAddressDialog';
import { composeFormConfigs, getFieldNames, pickFieldValues } from '@/components/forms/utils/formUtils';
import type { LocationAddress } from '../types/locationAddress.types';

export interface LocationAddressDialogProps
{
    open: boolean;
    onClose: () => void;
    locationId: string;
    /** Pass an existing relationship to open in edit mode. */
    locationAddress?: LocationAddress | null;
}

export function LocationAddressDialog( { open, onClose, locationId, locationAddress }: LocationAddressDialogProps )
{
    const { t } = useTranslation();
    const { data: countries = [] } = useCountries();

    const isEdit = locationAddress != null;
    const formId = isEdit ? 'location-address-form-edit' : 'location-address-form-create';

    const createAddress = useCreateAddress();
    const createLocationAddress = useCreateLocationAddress();
    const updateLocationAddress = useUpdateLocationAddress( locationAddress?.id ?? '' );

    const mutations = [createAddress, createLocationAddress, updateLocationAddress];
    const isPending = mutations.some( mutation => mutation.isPending );
    const error = mutations.find( mutation => mutation.error )?.error;

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( k => k + 1 ); }, [open] );

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [confirmingRemove, setConfirmingRemove] = useState( false );

    const countryOptions = countries.map( country => ( { value: country.id, label: country.label } ) );

    const relationshipConfig = buildLocationAddressFormConfig(
        isEdit ? { addressTypeId: locationAddress.addressTypeId } : undefined,
    );
    const addressConfig = buildAddressFormConfig( countryOptions, locationAddress?.address );

    // The address is always created, never updated, so its create context governs validation.
    const config = composeFormConfigs( [relationshipConfig, addressConfig], addressConfig.context );

    const addressFields = getFieldNames( addressConfig );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const addressTypeId = data.addressTypeId as string;
        const addressData = pickFieldValues( addressConfig, data ) as Partial<Address>;

        if( !isEdit )
        {
            const address = await createAddress.mutateAsync( addressData );
            await createLocationAddress.mutateAsync( { locationId, addressId: address.id, addressTypeId } );
        }
        else
        {
            const current = locationAddress.address as Record<string, unknown> | undefined;
            const addressChanged = addressFields.some( key => ( data[key] ?? undefined ) !== ( current?.[key] ?? undefined ) );

            if( addressChanged )
            {
                const address = await createAddress.mutateAsync( addressData );
                await updateLocationAddress.mutateAsync( { addressId: address.id, addressTypeId } );
            }
            else
            {
                await updateLocationAddress.mutateAsync( { addressTypeId } );
            }
        }

        handleClose();
    };

    const handleClose = () =>
    {
        mutations.forEach( mutation => mutation.reset() );
        setMenuAnchor( null );
        setConfirmingRemove( false );
        onClose();
    };

    const handleRemoveClick = () =>
    {
        setMenuAnchor( null );
        setConfirmingRemove( true );
    };

    const title = isEdit
        ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{t( 'pages.company.location.addressTitle' )}</span>
                <IconButton
                    size="small"
                    aria-label={t( 'shared.buttons.moreActions' )}
                    aria-haspopup="true"
                    aria-expanded={menuAnchor ? 'true' : undefined}
                    onClick={( event ) => setMenuAnchor( event.currentTarget )}
                >
                    <IconRenderer iconKey="dotsVertical" size={18} />
                </IconButton>
            </Box>
        )
        : t( 'pages.company.location.addAddressButton' );

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                title={title}
                actions={
                    <>
                        <Button onClick={handleClose} disabled={isPending}>
                            {t( 'shared.buttons.cancel' )}
                        </Button>
                        <Button
                            variant="contained"
                            form={formId}
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending
                                ? t( 'shared.interactions.saving' )
                                : t( isEdit ? 'shared.buttons.save' : 'shared.buttons.create' )}
                        </Button>
                    </>
                }
            >
                <FormScaffold>
                    <FormScaffold.Feedback message={error ? t( error.key ) : undefined} />
                    <FormScaffold.Body>
                        <BaseFormRenderer
                            key={formKey}
                            config={config}
                            onSubmit={handleSubmit}
                            loading={isPending}
                            formId={formId}
                            formScope="locationAddress"
                        />
                    </FormScaffold.Body>
                </FormScaffold>
            </Dialog>

            {isEdit && (
                <>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean( menuAnchor )}
                        onClose={() => setMenuAnchor( null )}
                    >
                        <MenuItem onClick={handleRemoveClick} sx={{ color: 'danger.main', gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'pages.company.location.removeAddress' )}
                        </MenuItem>
                    </Menu>

                    <RemoveLocationAddressDialog
                        open={confirmingRemove}
                        onClose={() => setConfirmingRemove( false )}
                        locationAddress={locationAddress ?? null}
                        onRemoved={handleClose}
                    />
                </>
            )}
        </>
    );
}
