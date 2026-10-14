/**
 * Location Domain Playground
 *
 * Exercises the Location domain layer independently from any consumer page.
 * Shows the create/edit dialogs and fixture data.
 *
 * What to check here:
 * - Form fields render from the model definition
 * - companyId renders as a constrained autocomplete loaded from the company domain
 * - locationTypeId renders as a constrained autocomplete with translated options
 * - Create dialog works standalone and with a defaultCompanyId
 * - Edit dialog pre-populates from the location record
 * - Data preview shows the config driving each scenario
 */

import { useState } from 'react';
import { Box, Stack, Typography, Button, Divider } from '@/components/ui';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import { buildLocationFormConfig } from '@/domains/business/location/config/buildLocationFormConfig';
import { LocationDialog } from '@/domains/business/location/components/LocationDialog';
import { of } from 'rxjs';
import { companyService } from '@/domains/business/company';
import type { Location } from '@/domains/business/location/types/location.types';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { RequestState } from '@/services/domain/requestState';
import type { Company } from '@/domains/business/company';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_COMPANIES = [
    { id: '1', name: 'Natural Supplies Co.' },
    { id: '2', name: 'Green Living Market' },
    { id: '3', name: 'Swift Dispatch Ltd' },
] as Company[];

const MOCK_COMPANY_ID = MOCK_COMPANIES[0].id;

const MOCK_LOCATION: Location = {
    id: '1',
    ownerId: '1',
    companyId: MOCK_COMPANY_ID,
    locationTypeId: '1',
    label: 'Perth Warehouse',
    description: 'Main distribution centre for WA',
};

// Mock the company boundary so the dialog works without auth
companyService.observeAll = (): DataQuerySource<Company[]> => ( {
    data: of( MOCK_COMPANIES ),
    request: of<RequestState>( { isFetching: false } ),
} );

// ─── Playground ───────────────────────────────────────────────────────────────

export function LocationPlayground()
{
    const [createOpen, setCreateOpen] = useState( false );
    const [createWithCompanyOpen, setCreateWithCompanyOpen] = useState( false );
    const [editOpen, setEditOpen] = useState( false );

    // Strip Yup internals so the preview shows the author-facing config shape
    const previewableConfig = () =>
    {
        const config = buildLocationFormConfig( [] );
        const { validationSchema: _schema, ...rest } = config;
        return {
            ...rest,
            validationSchema: 'modelRegistry.getValidation( "location" ).pick( ["companyId", "label", "locationTypeId", "description"] )',
        };
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Location Domain</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Location dialogs are self-contained — they load their own company options
                and type registry data. Consumers mount the dialog and optionally pass defaults.
            </Typography>

            <Stack spacing={4}>
                {/* Dialog triggers */}
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => setCreateOpen( true )}>
                        Create (standalone)
                    </Button>
                    <Button variant="outlined" onClick={() => setCreateWithCompanyOpen( true )}>
                        Create (with default company)
                    </Button>
                    <Button variant="outlined" onClick={() => setEditOpen( true )}>
                        Edit
                    </Button>
                </Stack>

                <LocationDialog
                    open={createOpen}
                    onClose={() => setCreateOpen( false )}
                />

                <LocationDialog
                    open={createWithCompanyOpen}
                    onClose={() => setCreateWithCompanyOpen( false )}
                    defaultCompanyId={MOCK_COMPANY_ID}
                />

                <LocationDialog
                    open={editOpen}
                    onClose={() => setEditOpen( false )}
                    location={MOCK_LOCATION}
                />

                <Divider />

                <PlaygroundDataPreview
                    title="FormConfig"
                    caption="The config driving the form. companyId and locationTypeId are autocomplete fields; company options are loaded by the dialog via useCompanies."
                    data={previewableConfig()}
                />

                <PlaygroundDataPreview
                    title="Fixture Location"
                    caption="The location record used to pre-populate the edit dialog."
                    data={MOCK_LOCATION}
                />
            </Stack>
        </Box>
    );
}

export default LocationPlayground;
