/**
 * Address Domain Playground
 *
 * Exercises the Address domain layer independently from any consumer page.
 * Address has no dialog of its own — its form is composed into owning dialogs — so the
 * form config is rendered directly and submission is captured rather than sent.
 *
 * What to check here:
 * - Form fields render from the model definition
 * - countryId renders as a constrained autocomplete from caller-supplied options
 * - Prefilled scenario populates from an address record
 * - Submitted payload shows exactly what useCreateAddress would receive
 */

import { useState } from 'react';
import { Box, Stack, Typography, Divider } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import { COUNTRY_OPTION_MOCKS, ADDRESS_MOCKS } from '@/devTools/mocks/address.mocks';
import { buildAddressFormConfig } from '@/domains/business/address/config/buildAddressFormConfig';

// ─── Playground ───────────────────────────────────────────────────────────────

export function AddressPlayground()
{
    const [submitted, setSubmitted] = useState<Record<string, unknown> | null>( null );

    const emptyConfig = buildAddressFormConfig( COUNTRY_OPTION_MOCKS );
    const prefilledConfig = buildAddressFormConfig( COUNTRY_OPTION_MOCKS, ADDRESS_MOCKS[1] );

    // Strip Yup internals so the preview shows the author-facing config shape
    const previewableConfig = () =>
    {
        const { validationSchema: _schema, ...rest } = emptyConfig;
        return {
            ...rest,
            validationSchema:
                'modelRegistry.getValidation( "address" ).pick( ["line1", "line2", "city", "postalCode", "countryId"] )',
        };
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Address Domain</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Addresses are created, never edited in place. The owning dialog supplies country
                options and composes this form alongside its own fields.
            </Typography>

            <Stack spacing={4}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ flex: 1, maxWidth: 480 }}>
                        <Typography variant="h6" gutterBottom>Empty</Typography>
                        <FormScaffold>
                            <FormScaffold.Body>
                                <BaseFormRenderer
                                    config={emptyConfig}
                                    onSubmit={async data => setSubmitted( data )}
                                    formId="address-playground-empty"
                                    formScope="address"
                                />
                            </FormScaffold.Body>
                        </FormScaffold>
                    </Box>

                    <Box sx={{ flex: 1, maxWidth: 480 }}>
                        <Typography variant="h6" gutterBottom>Prefilled</Typography>
                        <FormScaffold>
                            <FormScaffold.Body>
                                <BaseFormRenderer
                                    config={prefilledConfig}
                                    onSubmit={async data => setSubmitted( data )}
                                    formId="address-playground-prefilled"
                                    formScope="address"
                                />
                            </FormScaffold.Body>
                        </FormScaffold>
                    </Box>
                </Stack>

                <Divider />

                <PlaygroundDataPreview
                    title="Submitted payload"
                    caption="What useCreateAddress would receive. ownerId is stamped by the backend from the actor."
                    data={submitted ?? { note: 'Submit a form to capture its payload' }}
                />

                <PlaygroundDataPreview
                    title="FormConfig"
                    caption="The config driving the form. countryId is an autocomplete; options are passed in by the caller."
                    data={previewableConfig()}
                />

                <PlaygroundDataPreview
                    title="Fixture Addresses"
                    caption="Address records shared with the LocationAddress playground."
                    data={ADDRESS_MOCKS}
                />
            </Stack>
        </Box>
    );
}

export default AddressPlayground;
