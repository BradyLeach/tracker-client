/**
 * LocationAddress Domain Playground
 *
 * Exercises the LocationAddress relationship shape independently from any consumer page.
 * LocationAddress is relationship plumbing with no UI of its own, so this shows the
 * composed records a location observes and the address type options it classifies by.
 *
 * What to check here:
 * - One location holds many relationships, distinguished by addressTypeId
 * - Each relationship carries its hydrated address and addressType
 * - Address type options come from the type registry with translated labels
 */

import i18n from 'i18next';
import { Box, Stack, Typography, Divider } from '@/components/ui';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import { LOCATION_ADDRESS_MOCKS, LOCATION_ADDRESS_LOCATION_ID } from '@/devTools/mocks/address.mocks';
import { typeRegistry } from '@/core/models/TypeRegistry';

// ─── Playground ───────────────────────────────────────────────────────────────

export function LocationAddressPlayground()
{
    const addressTypeOptions = typeRegistry
        .getByModel( 'addressType' )
        .map( type => ( { value: type.id, label: i18n.t( `types.addressType.${type.label}` ) } ) );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>LocationAddress Domain</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                The relationship between a location and an address, classified by address type.
                Removing an address from a location deletes this relationship only; the address
                record is left in place.
            </Typography>

            <Stack spacing={4}>
                <Stack spacing={1}>
                    <Typography variant="h6">Location {LOCATION_ADDRESS_LOCATION_ID}</Typography>
                    {LOCATION_ADDRESS_MOCKS.map( relationship => (
                        <Typography key={relationship.id} variant="body2">
                            {relationship.addressType?.label}: {relationship.address?.line1}, {relationship.address?.city}
                        </Typography>
                    ) )}
                </Stack>

                <Divider />

                <PlaygroundDataPreview
                    title="observeByLocation result"
                    caption="The rows useLocationAddressesByLocation emits — address and addressType joined from the store."
                    data={LOCATION_ADDRESS_MOCKS}
                />

                <PlaygroundDataPreview
                    title="Address type options"
                    caption="typeRegistry.getByModel( 'addressType' ) — live from bootstrap, empty until types load."
                    data={addressTypeOptions}
                />
            </Stack>
        </Box>
    );
}

export default LocationAddressPlayground;
