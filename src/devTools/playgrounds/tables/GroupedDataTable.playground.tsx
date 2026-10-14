/**
 * GroupedDataTable Playground
 *
 * Interactive reference for the grouped/expandable table system.
 * Uses partnership fixtures grouped by company to validate:
 *
 *  1. Group header rows — chevron, label, child count badge, rollup cells.
 *  2. Per-group sub-header rows — child column headers aligned to data rows.
 *  3. Child data rows — indented, left border accent, full column set.
 *  4. Expand / collapse — per-group toggle with chevron rotation.
 *  5. State rollup — Active when any relationship is non-terminal.
 *  6. Stable sort — groups appear alphabetically by company name.
 *  7. Per-group colour variation on left border.
 *  8. Loading / empty scenarios.
 *
 * State registry is seeded locally so rollup chips render correctly.
 */

import { useState, useMemo } from 'react';
import { Box, Stack, Typography, Button, Paper } from '@/components/ui';
import { GroupedDataTable } from '@/components/tables';
import { useCollection, groupRows, rollupSortValues, GROUP_LABEL_FIELD } from '@/core/collection';
import { getPartnershipsGroupedTableBehavior } from '@/domains/business/partnership/orchestrators/partnerships.orchestrator';
import { PARTNERSHIP_GROUPED_CONFIG_MOCK, PARTNERSHIP_TYPE_MOCK_IDS } from '@/devTools/mocks/partnership.mocks';
import type { Partnership } from '@/domains/business/partnership/types/partnership.types';

// ─── Reference data ───────────────────────────────────────────────────────────
// This playground used to seed the registries directly. They are projections of the
// entity store now, so the type and state labels below resolve from whatever the signed-in
// session holds. Fixture rows carrying playground-only ids render those labels unresolved
// until the playgrounds get an offline bootstrap of their own — saasy-soap-w3o.

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// Multiple partnerships per company so grouping and rollup are clearly visible.
// Natural Supplies Co. — 1 active + 1 ended → Active rollup
// Green Living Market  — 2 active            → Active rollup
// Alpine Packaging     — 1 ended             → Inactive rollup

const PLAYGROUND_FIXTURES: Partnership[] = [
    // ── Natural Supplies Co. (two relationships) ──────────────────────────────
    {
        id: '11111111-0000-0000-0000-000000000001',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000001',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.supplier,
        contactName: 'Sarah Mitchell',
        contactEmail: 'sarah@naturalsupplies.com',
        contactPhone: '+44 7700 900001',
        rating: 5,
        startedAt: '2023-03-15',
        createdAt: '2023-03-15T09:00:00Z',
        updatedAt: '2025-11-01T10:30:00Z',
        currentStateGraphStateId: 'sgs-active-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000001', name: 'Natural Supplies Co.' } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000002',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000001',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.logistics,
        contactName: 'Sarah Mitchell',
        contactEmail: 'sarah@naturalsupplies.com',
        contactPhone: '+44 7700 900001',
        rating: 3,
        startedAt: '2022-06-01',
        endedAt: '2024-12-31',
        createdAt: '2022-06-01T09:00:00Z',
        updatedAt: '2025-01-05T12:00:00Z',
        currentStateGraphStateId: 'sgs-ended-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000001', name: 'Natural Supplies Co.' } as Partnership['company'],
    },

    // ── Green Living Market (two active relationships) ────────────────────────
    {
        id: '11111111-0000-0000-0000-000000000003',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000002',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.stockist,
        contactName: 'James Okafor',
        contactEmail: 'james@greenliving.co.uk',
        rating: 4,
        startedAt: '2024-01-10',
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2025-10-15T08:00:00Z',
        currentStateGraphStateId: 'sgs-active-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000002', name: 'Green Living Market' } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000004',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000002',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.retailer,
        contactName: 'James Okafor',
        contactEmail: 'james@greenliving.co.uk',
        rating: 4,
        startedAt: '2025-03-01',
        createdAt: '2025-03-01T09:00:00Z',
        updatedAt: '2025-12-01T08:00:00Z',
        currentStateGraphStateId: 'sgs-prospect-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000002', name: 'Green Living Market' } as Partnership['company'],
    },

    // ── Alpine Packaging GmbH (terminated relationship) ───────────────────────
    {
        id: '11111111-0000-0000-0000-000000000005',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000004',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.manufacturer,
        contactName: 'Tobias Keller',
        contactEmail: 'tobias@alpinepackaging.de',
        rating: 4,
        startedAt: '2022-11-20',
        endedAt: '2025-06-30',
        createdAt: '2022-11-20T09:30:00Z',
        updatedAt: '2025-06-30T17:00:00Z',
        currentStateGraphStateId: 'sgs-terminated-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000004', name: 'Alpine Packaging GmbH' } as Partnership['company'],
    },

    // ── Craft Solutions IO (prospect) ─────────────────────────────────────────
    {
        id: '11111111-0000-0000-0000-000000000006',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000005',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.consultant,
        contactName: 'Mei-Lin Zhao',
        contactEmail: 'meilin@craftsolutions.io',
        rating: 5,
        startedAt: '2025-02-01',
        createdAt: '2025-02-01T10:00:00Z',
        updatedAt: '2025-12-10T09:00:00Z',
        currentStateGraphStateId: 'sgs-prospect-001',
        company: { id: 'bbbbbbbb-0000-0000-0000-000000000005', name: 'Craft Solutions IO' } as Partnership['company'],
    },
];

// ─── Config ───────────────────────────────────────────────────────────────────

// Written out in the mocks rather than built from the model registry, so the config
// driving the output is readable beside it and the playground renders without an
// authenticated bootstrap. The behaviour below is a pure function and stays live.
const groupedConfig = PARTNERSHIP_GROUPED_CONFIG_MOCK;

// groupLabel names a group record, so it feeds groupRows rather than the renderer.
const { groupLabel, ...groupedBehavior } = getPartnershipsGroupedTableBehavior();

const groupSortValues = rollupSortValues<Partnership>( groupedBehavior.rollups );

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS = [
    {
        label: 'With Data',
        rows: PLAYGROUND_FIXTURES,
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

export function GroupedDataTablePlayground()
{
    const [index, setIndex] = useState( 0 );
    const scenario = SCENARIOS[index];

    const groups = useMemo(
        () => groupRows( scenario.rows, groupedConfig.groupBy, groupLabel ),
        [scenario.rows],
    );

    const collection = useCollection( groups, {
        fields: [GROUP_LABEL_FIELD],
        sortValues: groupSortValues,
    } );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>GroupedDataTable — Grouped View</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Partnerships grouped by company. Click a group header row to expand/collapse.
                The rollup cell shows <strong>Active</strong> if any relationship in the group
                has a non-terminal state, otherwise <strong>Inactive</strong>.
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
            <Paper sx={{ overflow: 'hidden', p: 0 }}>
                <GroupedDataTable<Partnership>
                    config={groupedConfig}
                    {...groupedBehavior}
                    groups={collection.visibleRows}
                    getRowId={row => row.id}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={scenario.isLoading}
                />
            </Paper>
        </Box>
    );
}
