/**
 * DataTable Playground
 *
 * Interactive reference for the smart table system.
 * Shows the column config that drives the rendered output side-by-side.
 *
 * Intended for new developers to understand:
 *  1. How TableColumnFactory derives columns from the model registry.
 *  2. How domain config builders select, order, and override columns.
 *  3. How DataTable renders from config — no hardcoded columns.
 *
 * Layer recap:
 *  ModelRegistry → TableColumnFactory → buildPartnershipsTableConfig → DataTable
 */

import { useState } from 'react';
import { Box, Stack, Typography, Button, Paper, Divider } from '@/components/ui';
import { DataTable } from '@/components/tables';
import { useCollection } from '@/core/collection';
import { PARTNERSHIP_COLUMN_MOCKS, PARTNERSHIP_MOCKS } from '@/devTools/mocks/partnership.mocks';

// ─── Config ───────────────────────────────────────────────────────────────────

// Written out in the mocks rather than built from the model registry, so the
// config driving the output below is readable beside it and the playground does
// not depend on an authenticated bootstrap to render.
//
// Every column is marked sortable here, so the playground exercises sort without
// changing what the domain itself declares.
const tableConfig = {
    columns: PARTNERSHIP_COLUMN_MOCKS.map( col => ( { ...col, sortable: true } ) ),
    emptyMessage: 'pages.partnerships.emptyState.headline',
};

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS = [
    {
        label: 'With Data',
        rows: PARTNERSHIP_MOCKS,
        isLoading: false,
    },
    {
        label: 'Loading',
        rows: [],
        isLoading: true,
    },
    {
        label: 'Empty',
        rows: [],
        isLoading: false,
    },
];

// ─── Playground ───────────────────────────────────────────────────────────────

export function DataTablePlayground()
{
    const [index, setIndex] = useState( 0 );
    const scenario = SCENARIOS[index];

    // The company column renders `company.name` but is keyed on `company`, an
    // object. A selector supplies the value the column actually displays.
    const collection = useCollection( scenario.rows, {
        fields: tableConfig.columns,
        sortValues: { company: row => row.company?.name },
    } );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>DataTable — Smart Table</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Columns are derived from the backend model registry via <code>TableColumnFactory</code>,
                then selected and ordered by the domain config builder.
                <code>DataTable</code> receives the config and renders — it knows nothing about the domain.
            </Typography>

            {/* Scenario selector */}
            <Stack direction="row" spacing={1} mb={3}>
                {SCENARIOS.map( ( s, i ) => (
                    <Button
                        key={s.label}
                        size="small"
                        variant={i === index ? 'contained' : 'outlined'}
                        onClick={() => setIndex( i )}
                    >
                        {s.label}
                    </Button>
                ) )}
            </Stack>

            {/* Rendered output */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Rendered Output
            </Typography>
            <Paper sx={{ mb: 3, overflow: 'hidden', p: 0 }}>
                <DataTable
                    {...tableConfig}
                    rows={collection.visibleRows}
                    getRowId={row => row.id}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={scenario.isLoading}
                    maxHeight={320}
                />
            </Paper>

            {/* Config panel */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Column Config — <code>buildPartnershipsTableConfig()</code>
            </Typography>
            <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {tableConfig.columns.length} columns · factory-derived fields are marked by key · manually declared columns have a <code>render</code> override
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Typography
                    component="pre"
                    fontFamily="monospace"
                    fontSize={11}
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', m: 0 }}
                >
                    {JSON.stringify( tableConfig.columns.map( col => ( {
                        key: col.key,
                        label: col.label,
                        type: col.type,
                        align: col.align,
                        ...( col.options ? { options: col.options } : {} ),
                        ...( col.render ? { render: '(row) => ReactNode' } : {} ),
                    } ) ), null, 2 )}
                </Typography>
            </Paper>
        </Box>
    );
}
