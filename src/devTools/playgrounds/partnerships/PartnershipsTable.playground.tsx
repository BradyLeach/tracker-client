/**
 * PartnershipsTable Playground
 *
 * Renders the partnerships DataTable with fixture data.
 * Useful for testing column config, renderers, and layout
 * before the backend partnership API is available.
 */

import { Box, Card, Typography } from '@/components/ui';
import { DataTable } from '@/components/tables';
import { useCollection } from '@/core/collection';
import { PARTNERSHIP_COLUMN_MOCKS, PARTNERSHIP_MOCKS } from '@/devTools/mocks/partnership.mocks';

// Written out in the mocks rather than built from the model registry — see
// PARTNERSHIP_COLUMN_MOCKS.
const tableConfig = {
    columns: PARTNERSHIP_COLUMN_MOCKS,
    emptyMessage: 'pages.partnerships.emptyState.headline',
};

export function PartnershipsTablePlayground()
{
    const collection = useCollection( PARTNERSHIP_MOCKS, { fields: tableConfig.columns } );

    return (
        <Box p={4}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Partnerships Table (Fixture Data)
            </Typography>

            <Card sx={{ overflow: 'hidden', padding: 0 }}>
                <DataTable
                    {...tableConfig}
                    rows={collection.visibleRows}
                    getRowId={row => row.id}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                />
            </Card>
        </Box>
    );
}
