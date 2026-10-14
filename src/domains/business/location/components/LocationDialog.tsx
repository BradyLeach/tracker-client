/**
 * LocationDialog
 *
 * Self-contained dialog for creating or editing a location.
 * Pass `location` to open in edit mode; omit for create mode.
 * Loads its own company options via useCompanies.
 * Consumers may pass defaultCompanyId to pre-select in create mode.
 *
 * Create presents the location, its address type and one address as a single form, and
 * chains location → address → location address on submit. Edit presents the location and
 * lists its addresses; each opens in LocationAddressDialog.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, Button, Box, IconButton, Menu, MenuItem, Typography, List, ListItemButton, ListItemText,
} from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { useCountries } from '@/domains/system';
import { useCompanies } from '../../company';
import { useCreateAddress, buildAddressFormConfig } from '../../address';
import type { Address } from '../../address';
import {
    useCreateLocationAddress, useLocationAddressesByLocation, buildLocationAddressFormConfig, LocationAddressDialog,
} from '../../locationAddress';
import type { LocationAddress } from '../../locationAddress';
import { useCreateLocation } from '../hooks/useCreateLocation';
import { useUpdateLocation } from '../hooks/useUpdateLocation';
import { buildLocationFormConfig } from '../config/buildLocationFormConfig';
import { DeleteLocationDialog } from './DeleteLocationDialog';
import { composeFormConfigs, pickFieldValues } from '@/components/forms/utils/formUtils';
import type { Location } from '../types/location.types';

export interface LocationDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing location to open in edit mode. */
    location?: Location | null;
    /** Pre-select the company in create mode. */
    defaultCompanyId?: string;
}

export function LocationDialog( {
    open, onClose, location, defaultCompanyId,
}: LocationDialogProps )
{
    const { t } = useTranslation();
    const { data: companies = [] } = useCompanies();
    const { data: countries = [] } = useCountries();

    const isEdit = location != null;
    const formId = isEdit ? 'location-form-edit' : 'location-form-create';

    const createMutation = useCreateLocation();
    const updateMutation = useUpdateLocation( location?.id ?? '' );
    const createAddress = useCreateAddress();
    const createLocationAddress = useCreateLocationAddress();

    const mutations = isEdit ? [updateMutation] : [createMutation, createAddress, createLocationAddress];
    const isPending = mutations.some( mutation => mutation.isPending );
    const error = mutations.find( mutation => mutation.error )?.error;
    const reset = () => mutations.forEach( mutation => mutation.reset() );

    const { data: locationAddresses = [] } = useLocationAddressesByLocation( location?.id );
    const [addingAddress, setAddingAddress] = useState( false );
    const [editingAddress, setEditingAddress] = useState<LocationAddress | null>( null );

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( k => k + 1 ); }, [open] );

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [confirmingDelete, setConfirmingDelete] = useState( false );

    const companyOptions = companies.map( c => ( { value: c.id, label: c.name } ) );

    const defaults: Partial<Location> | undefined = isEdit
        ? {
            companyId: location.companyId,
            label: location.label,
            locationTypeId: location.locationTypeId,
            description: location.description,
        }
        : defaultCompanyId ? { companyId: defaultCompanyId } : undefined;

    const locationConfig = buildLocationFormConfig( companyOptions, defaults );
    const relationshipConfig = buildLocationAddressFormConfig();
    const addressConfig = buildAddressFormConfig( countries.map( country => ( { value: country.id, label: country.label } ) ) );

    // Create composes the three domains' configs into one form; edit is the location alone.
    const config = isEdit
        ? locationConfig
        : composeFormConfigs( [locationConfig, relationshipConfig, addressConfig] );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        if( isEdit )
        {
            await updateMutation.mutateAsync( data as Partial<Location> );
        }
        else
        {
            const created = await createMutation.mutateAsync( pickFieldValues( locationConfig, data ) as Partial<Location> );
            const address = await createAddress.mutateAsync( pickFieldValues( addressConfig, data ) as Partial<Address> );
            await createLocationAddress.mutateAsync( {
                locationId: created.id,
                addressId: address.id,
                addressTypeId: data.addressTypeId as string,
            } );
        }

        handleClose();
    };

    const handleClose = () =>
    {
        reset();
        setMenuAnchor( null );
        setConfirmingDelete( false );
        onClose();
    };

    const handleDeleteClick = () =>
    {
        setMenuAnchor( null );
        setConfirmingDelete( true );
    };

    const title = isEdit
        ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{t( 'forms.location.editTitle' )}</span>
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
        : t( 'forms.location.title' );

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
                            formScope="location"
                        />

                        {isEdit && (
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {t( 'pages.company.location.addresses' )}
                                    </Typography>
                                    <Button size="small" onClick={() => setAddingAddress( true )}>
                                        {t( 'pages.company.location.addAddressButton' )}
                                    </Button>
                                </Box>

                                {locationAddresses.length === 0
                                    ? (
                                        <Typography variant="body2" color="text.secondary">
                                            {t( 'pages.company.location.noAddresses' )}
                                        </Typography>
                                    )
                                    : (
                                        <List disablePadding>
                                            {locationAddresses.map( relationship => (
                                                <ListItemButton
                                                    key={relationship.id}
                                                    onClick={() => setEditingAddress( relationship )}
                                                >
                                                    <ListItemText
                                                        primary={relationship.addressType
                                                            ? t( `types.addressType.${relationship.addressType.label}` )
                                                            : undefined}
                                                        secondary={[
                                                            relationship.address?.line1,
                                                            relationship.address?.city,
                                                            relationship.address?.postalCode,
                                                        ].filter( Boolean ).join( ', ' )}
                                                    />
                                                </ListItemButton>
                                            ) )}
                                        </List>
                                    )
                                }
                            </Box>
                        )}
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
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'danger.main', gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'shared.buttons.delete' )}
                        </MenuItem>
                    </Menu>

                    <DeleteLocationDialog
                        open={confirmingDelete}
                        onClose={() => setConfirmingDelete( false )}
                        location={location ?? null}
                        onDeleted={handleClose}
                    />

                    <LocationAddressDialog
                        open={addingAddress || editingAddress != null}
                        onClose={() => { setAddingAddress( false ); setEditingAddress( null ); }}
                        locationId={location.id}
                        locationAddress={editingAddress}
                    />
                </>
            )}
        </>
    );
}
