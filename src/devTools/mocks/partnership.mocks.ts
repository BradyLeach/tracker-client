/**
 * Partnership mock data
 *
 * Shared across playgrounds that need partnership rows to render.
 * Lives in devTools — not domain code, not used in production.
 */

import type { Partnership } from '@/domains/business/partnership/types/partnership.types';
import type { SystemType } from '@/domains/system';
import type { GroupedTableConfig, TableColumnConfig } from '@/components/tables';

export const PARTNERSHIP_TYPE_MOCKS: SystemType[] = [
    { id: 'dddddddd-0000-0000-0000-000000000001', label: 'supplier' },
    { id: 'dddddddd-0000-0000-0000-000000000002', label: 'stockist' },
    { id: 'dddddddd-0000-0000-0000-000000000003', label: 'logistics' },
    { id: 'dddddddd-0000-0000-0000-000000000004', label: 'manufacturer' },
    { id: 'dddddddd-0000-0000-0000-000000000005', label: 'consultant' },
    { id: 'dddddddd-0000-0000-0000-000000000006', label: 'retailer' },
];

/** Label → id lookup for building mock rows. */
export const PARTNERSHIP_TYPE_MOCK_IDS = Object.fromEntries(
    PARTNERSHIP_TYPE_MOCKS.map( type => [type.label, type.id] )
) as Record<string, string>;

export const PARTNERSHIP_MOCKS: Partnership[] = [
    {
        id: '11111111-0000-0000-0000-000000000001',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000001',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.supplier,
        contactName: 'Sarah Mitchell',
        contactEmail: 'sarah@naturalsupplies.com',
        contactPhone: '+44 7700 900001',
        rating: 5,
        notes: 'Primary shea butter supplier. Always on time.',
        startedAt: '2023-03-15',
        createdAt: '2023-03-15T09:00:00Z',
        updatedAt: '2025-11-01T10:30:00Z',
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000001',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000001',
            name: 'Natural Supplies Co.',
        } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000002',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000002',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.stockist,
        contactName: 'James Okafor',
        contactEmail: 'james@greenliving.co.uk',
        rating: 4,
        startedAt: '2024-01-10',
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2025-10-15T08:00:00Z',
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000002',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000002',
            name: 'Green Living Market',
        } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000003',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000003',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.logistics,
        contactName: 'Priya Nair',
        contactEmail: 'priya@swiftdispatch.com',
        rating: 3,
        startedAt: '2023-07-01',
        createdAt: '2023-07-01T14:00:00Z',
        updatedAt: '2025-09-20T12:00:00Z',
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000003',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000003',
            name: 'Swift Dispatch Ltd',
        } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000004',
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
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000004',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000004',
            name: 'Alpine Packaging GmbH',
        } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000005',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000005',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.consultant,
        contactName: 'Mei-Lin Zhao',
        contactEmail: 'meilin@craftsolutions.io',
        rating: 5,
        notes: 'Formulation consultant for new product lines.',
        startedAt: '2025-02-01',
        createdAt: '2025-02-01T10:00:00Z',
        updatedAt: '2025-12-10T09:00:00Z',
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000005',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000005',
            name: 'Craft Solutions IO',
        } as Partnership['company'],
    },
    {
        id: '11111111-0000-0000-0000-000000000006',
        ownerId: 'aaaaaaaa-0000-0000-0000-000000000001',
        companyId: 'bbbbbbbb-0000-0000-0000-000000000006',
        partnershipTypeId: PARTNERSHIP_TYPE_MOCK_IDS.supplier,
        contactName: 'Anna Bergström',
        contactEmail: 'anna@nordicbotanicals.se',
        rating: 2,
        startedAt: '2024-05-12',
        createdAt: '2024-05-12T08:00:00Z',
        updatedAt: '2026-01-05T11:00:00Z',
        currentStateGraphStateId: 'cccccccc-0000-0000-0000-000000000006',
        company: {
            id: 'bbbbbbbb-0000-0000-0000-000000000006',
            name: 'Nordic Botanicals AB',
        } as Partnership['company'],
    },
];

// ─── Column config ────────────────────────────────────────────────────────────

/**
 * The partnership columns, written out rather than derived.
 *
 * `buildPartnershipsTableConfig` reads these from the model registry, which only
 * holds the authenticated definitions after bootstrap. A playground that called it
 * threw on render and took every other tab on the page with it.
 *
 * Written out, the config a playground feeds the renderer is readable in the file
 * beside the output it produces — which is the question the data playground exists
 * to answer. Keep in step with the builder when the model changes.
 */
export const PARTNERSHIP_COLUMN_MOCKS: TableColumnConfig<Partnership>[] = [
    {
        key: 'company',
        label: 'tables.partnerships.columns.company',
        type: 'text',
        render: ( row: Partnership ) => row.company?.name ?? '—',
    },
    { key: 'partnershipTypeId', label: 'tables.partnerships.columns.partnershipType', type: 'text', align: 'left' },
    { key: 'contactName', label: 'tables.partnerships.columns.contactName', type: 'text', align: 'left' },
    { key: 'contactEmail', label: 'tables.partnerships.columns.contactEmail', type: 'email', align: 'left' },
    { key: 'contactPhone', label: 'tables.partnerships.columns.contactPhone', type: 'text', align: 'left' },
    { key: 'rating', label: 'tables.partnerships.columns.rating', type: 'rating', align: 'right', max: 5 },
    {
        key: 'currentStateGraphStateId',
        label: 'tables.partnerships.columns.currentState',
        type: 'state',
        align: 'center',
    },
];

/** The grouped shape: partnerships under the company they belong to. */
export const PARTNERSHIP_GROUPED_CONFIG_MOCK: GroupedTableConfig<Partnership> = {
    groupBy: 'companyId',
    groupHeaderLabel: 'tables.partnerships.group.company',
    childSectionLabel: 'tables.partnerships.group.partnerships',
    // The group row carries the company, so the child rows do not repeat it.
    childColumns: PARTNERSHIP_COLUMN_MOCKS.filter( column => column.key !== 'company' ),
    defaultExpanded: false,
    emptyMessage: 'pages.partnerships.emptyState.headline',
};
