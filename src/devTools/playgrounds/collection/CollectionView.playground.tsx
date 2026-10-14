/**
 * CollectionView Playground
 *
 * One collection, drawn two ways. The toggle changes presentation and nothing
 * else — the same rows, the same column config, the same pipeline feed both.
 *
 * What to check here:
 * - switching modes keeps the sort, the search and the selection
 * - sorting from the table's headers and from the toolbar reach the same state
 * - a column's `card` slot decides where it lands on a card; the table ignores it
 * - loading renders in both modes
 * - an empty collection shows the caller's EmptyState with its call to action
 * - a collection emptied by a search shows "no matches" instead, with no action:
 *   search for "zzz" with data loaded to see the difference
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, EmptyState, Stack, Typography } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle } from '@/components/collection';
import type { CollectionSortOption, CollectionViewMode } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { PARTNERSHIP_COLUMN_MOCKS, PARTNERSHIP_MOCKS } from '@/devTools/mocks/partnership.mocks';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import type { Partnership } from '@/domains/business/partnership/types/partnership.types';

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * The same columns the table draws, with three given card slots. Everything else
 * falls to the card's body in config order.
 */
const COLUMNS = PARTNERSHIP_COLUMN_MOCKS.map( column =>
{
    if( column.key === 'company' ) return { ...column, card: 'title' as const, sortable: true };
    if( column.key === 'contactName' ) return { ...column, card: 'subtitle' as const, sortable: true };
    if( column.key === 'contactEmail' ) return { ...column, visible: false };
    return { ...column, sortable: true };
} );

const SORT_OPTIONS: CollectionSortOption[] = COLUMNS
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

const SCENARIOS = [
    { label: 'With data', rows: PARTNERSHIP_MOCKS, isLoading: false },
    { label: 'Loading', rows: [] as Partnership[], isLoading: true },
    { label: 'Empty', rows: [] as Partnership[], isLoading: false },
];

// ─── Playground ───────────────────────────────────────────────────────────────

export function CollectionViewPlayground()
{
    const { t } = useTranslation();
    const [mode, setMode] = useState<CollectionViewMode>( 'card' );
    const [index, setIndex] = useState( 0 );
    const [selectedId, setSelectedId] = useState<string>();

    const scenario = SCENARIOS[index];

    const collection = useCollection( scenario.rows, {
        fields: COLUMNS,
        sortValues: { company: row => row.company?.name },
    } );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>CollectionView — Table or Cards</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                A renderer, like <code>DataTable</code>. One column config drives both modes: the
                table renders a cell per column, the card reads each column&apos;s <code>card</code>{' '}
                slot. Search, sort and selection live in the caller&apos;s pipeline, so switching
                presentation changes nothing but the drawing.
            </Typography>

            <Stack direction="row" spacing={1} mb={3} alignItems="center" flexWrap="wrap" useFlexGap>
                {SCENARIOS.map( ( entry, entryIndex ) => (
                    <Button
                        key={entry.label}
                        size="small"
                        variant={entryIndex === index ? 'contained' : 'outlined'}
                        onClick={() => setIndex( entryIndex )}
                    >
                        {entry.label}
                    </Button>
                ) )}
                <Typography variant="caption" color="text.secondary">
                    mode: {mode} · selected: {selectedId ?? 'none'} · sort: {collection.sortKey ?? 'none'}
                </Typography>
            </Stack>

            <Box sx={{ mb: 2 }}>
                <CollectionToolbar
                    search={collection.search}
                    onSearchChange={collection.setSearch}
                    searchPlaceholder="Search partnerships"
                    sortOptions={SORT_OPTIONS}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    actions={<CollectionViewToggle mode={mode} onModeChange={setMode} />}
                />
            </Box>

            <Box sx={{ mb: 4 }}>
                <CollectionView<Partnership>
                    mode={mode}
                    rows={collection.visibleRows}
                    columns={COLUMNS}
                    getRowId={row => row.id}
                    selectedRowId={selectedId}
                    onRowClick={row => setSelectedId( previous => previous === row.id ? undefined : row.id )}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={scenario.isLoading}
                    isEmpty={scenario.rows.length === 0}
                    emptyState={
                        <EmptyState
                            icon="buildingWarehouse"
                            headline={t( 'pages.partnerships.emptyState.headline' )}
                            subtext={t( 'pages.partnerships.emptyState.subtext' )}
                            actions={[{
                                label: t( 'pages.partnerships.emptyState.addButton' ),
                                variant: 'contained',
                                onClick: () => undefined,
                            }]}
                        />
                    }
                    emptyMessage="collection.noMatches"
                />
            </Box>

            <PlaygroundDataPreview
                title="Column config"
                caption="One definition. `card` names the slot; the table ignores it, the card reads it."
                data={COLUMNS.map( ( { key, label, type, card, sortable, visible } ) => (
                    { key, label, type, card, sortable, visible }
                ) )}
            />
        </Box>
    );
}
