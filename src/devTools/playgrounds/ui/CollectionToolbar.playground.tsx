/**
 * CollectionToolbar Playground
 *
 * Wired to a real useCollection so the toolbar is exercised against the actual
 * pipeline, not mocked handlers — the rows below are whatever the pipeline
 * returns. Also shows the narrow-column behaviour the detail panel produces.
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, ResponsiveButton, Typography, Divider, Dialog, TextField, Stack, Switch } from '@/components/ui';
import { CollectionToolbar, CollectionPagination } from '@/components/collection';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import type { CollectionSortOption, CollectionFilterOption } from '@/components/collection';
import { useCollection } from '@/core/collection';
import type { CollectionField, CollectionFilter } from '@/core/collection';

interface Row
{
    id: string;
    name: string;
    website: string;
    partners: number;
    active: boolean;
}

const BASE_ROWS: Row[] = [
    { id: '1', name: 'Natural Supplies Co.', website: 'natural-supplies.test', partners: 2, active: true },
    { id: '2', name: 'Green Living Market', website: 'greenliving.test', partners: 2, active: true },
    { id: '3', name: 'Alpine Packaging GmbH', website: 'alpine-packaging.test', partners: 1, active: false },
    { id: '4', name: 'Nordic Botanicals AB', website: 'nordic-botanicals.test', partners: 3, active: true },
    { id: '5', name: 'Craft Solutions IO', website: 'craft-solutions.test', partners: 1, active: false },
    { id: '6', name: '3M Supplies', website: 'threem.test', partners: 0, active: false },
];

/** Padded out so paging has something to page through. */
const ROWS: Row[] = [
    ...BASE_ROWS,
    ...Array.from( { length: 17 }, ( _, index ) => ( {
        id: `f-${index + 1}`,
        name: `Filler Trading ${String( index + 1 ).padStart( 2, '0' )}`,
        website: `filler-${index + 1}.test`,
        partners: index % 4,
        active: index % 3 === 0,
    } ) ),
];

const FIELDS: CollectionField[] = [
    { key: 'name', type: 'text' },
    { key: 'website', type: 'url' },
    { key: 'partners', type: 'number' },
];

const SORT_OPTIONS: CollectionSortOption[] = [
    { key: 'name', label: 'Company' },
    { key: 'website', label: 'Website' },
    { key: 'partners', label: 'Partnerships' },
];

const FILTER_OPTIONS: CollectionFilterOption[] = [
    { key: 'active', label: 'Active only' },
    { key: 'hasPartners', label: 'Has partnerships' },
];

const FILTERS: CollectionFilter<Row>[] = [
    { key: 'active', predicate: row => row.active },
    { key: 'hasPartners', predicate: row => row.partners > 0 },
];

function ToolbarDemo( {
    width, filterOptions = FILTER_OPTIONS, filterShowCheckbox, filterMultiSelect,
}: {
    width?: number;
    filterOptions?: CollectionFilterOption[];
    filterShowCheckbox?: boolean;
    filterMultiSelect?: boolean;
} )
{
    const collection = useCollection( ROWS, { fields: FIELDS, filters: FILTERS, pageSize: 5 } );

    return (
        <Box sx={{ maxWidth: width, border: '1px solid', borderColor: 'border.base', borderRadius: 1, p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <CollectionToolbar
                    search={collection.search}
                    onSearchChange={collection.setSearch}
                    searchPlaceholder="Search companies"
                    sortOptions={SORT_OPTIONS}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    filterOptions={filterOptions}
                    activeFilterKeys={collection.activeFilterKeys}
                    onFilterToggle={collection.toggleFilter}
                    filterShowCheckbox={filterShowCheckbox}
                    filterMultiSelect={filterMultiSelect}
                    actions={
                        <ResponsiveButton
                            size="small"
                            variant="outlined"
                            color="primary"
                            iconKey="plus"
                            label="Add Partner"
                        />
                    }
                />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                page {collection.page}/{collection.pageCount} · {collection.visibleRows.length} shown · {collection.totalCount} matching
                {collection.sortKey ? ` · sorted by ${collection.sortKey} ${collection.sortDir}` : ' · natural order'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {collection.visibleRows.map( row => (
                    <Box
                        key={row.id}
                        sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, py: 0.5 }}
                    >
                        <span>{row.name}</span>
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                            {row.partners} · {row.active ? 'Active' : 'Inactive'}
                        </Box>
                    </Box>
                ) )}
                {collection.visibleRows.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No matches.</Typography>
                )}
            </Box>

            <CollectionPagination
                page={collection.page}
                pageCount={collection.pageCount}
                totalCount={collection.totalCount}
                pageSize={collection.pageSize}
                onPageChange={collection.setPage}
            />

            <PlaygroundDataPreview
                title="Collection state"
                caption="What the controls report; the pipeline turns this into visibleRows."
                data={collection.state}
                maxHeight={200}
            />

            <PlaygroundDataPreview
                title="Toolbar config"
                data={{ sortOptions: SORT_OPTIONS, filterOptions, fields: FIELDS }}
                maxHeight={240}
            />
        </Box>
    );
}

/**
 * A section of facet options with icons. The "Active only" scope is not an
 * option here: it is a toggle the caller places in the header slot.
 */
const SECTIONED_FILTER_OPTIONS: CollectionFilterOption[] = [
    { key: 'partners:none', label: 'No partnerships', iconKey: 'user', section: 'Partnerships' },
    { key: 'partners:one', label: 'One partnership', iconKey: 'user', section: 'Partnerships' },
    { key: 'partners:several', label: 'Several partnerships', iconKey: 'users', section: 'Partnerships' },
];

const SECTIONED_FILTERS: CollectionFilter<Row>[] = [
    { key: 'active', predicate: row => row.active },
    { key: 'partners:none', group: 'partners', predicate: row => row.partners === 0 },
    { key: 'partners:one', group: 'partners', predicate: row => row.partners === 1 },
    { key: 'partners:several', group: 'partners', predicate: row => row.partners > 1 },
];

/**
 * The filter menu's slots: the header narrows the section's options by name and
 * holds the scope toggle, the footer clears whatever is ticked. Both are the
 * caller's — the toolbar only places them.
 */
function SectionedFilterDemo()
{
    const collection = useCollection( ROWS, {
        fields: FIELDS,
        filters: SECTIONED_FILTERS,
        pageSize: 5,
        initialState: { activeFilterKeys: ['active'] },
    } );

    const [optionSearch, setOptionSearch] = useState( '' );

    const visibleOptions = SECTIONED_FILTER_OPTIONS.filter( option =>
        option.label.toLowerCase().includes( optionSearch.toLowerCase() ) );

    return (
        <Box sx={{ maxWidth: 420, border: '1px solid', borderColor: 'border.base', borderRadius: 1, p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <CollectionToolbar
                    filterOptions={visibleOptions}
                    activeFilterKeys={collection.activeFilterKeys}
                    onFilterToggle={collection.toggleFilter}
                    filterShowCheckbox
                    filterHeader={
                        <Stack spacing={0.5}>
                            <TextField
                                size="small"
                                fullWidth
                                value={optionSearch}
                                onChange={event => setOptionSearch( event.target.value )}
                                placeholder="Find option…"
                            />
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2">Active only</Typography>
                                <Switch
                                    checked={collection.isFilterActive( 'active' )}
                                    onChange={() => collection.toggleFilter( 'active' )}
                                />
                            </Stack>
                        </Stack>
                    }
                    filterFooter={
                        <ResponsiveButton
                            size="small"
                            variant="text"
                            color="inherit"
                            iconKey="close"
                            label="Clear all"
                            disabled={collection.activeFilterKeys.length === 0}
                            onClick={() => collection.setFilters( [] )}
                        />
                    }
                />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {collection.totalCount} matching · active: {collection.activeFilterKeys.join( ', ' ) || 'none'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {collection.visibleRows.map( row => (
                    <Box
                        key={row.id}
                        sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, py: 0.5 }}
                    >
                        <span>{row.name}</span>
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                            {row.partners} · {row.active ? 'Active' : 'Inactive'}
                        </Box>
                    </Box>
                ) )}
            </Box>

            <PlaygroundDataPreview title="Filter options" data={SECTIONED_FILTER_OPTIONS} maxHeight={240} />
        </Box>
    );
}

/**
 * The same button under three behaviours — the component owns the collapse,
 * the caller owns what pressing it does.
 */
function BehaviourDemo()
{
    const [dialogOpen, setDialogOpen] = useState( false );
    const [clicks, setClicks] = useState( 0 );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ResponsiveButton
                size="small"
                variant="outlined"
                color="inherit"
                iconKey="check"
                label={`Action (${clicks})`}
                onClick={() => setClicks( count => count + 1 )}
            />

            <ResponsiveButton
                size="small"
                variant="outlined"
                color="inherit"
                iconKey="settings"
                label="Open modal"
                onClick={() => setDialogOpen( true )}
            />

            <ResponsiveButton
                size="small"
                variant="outlined"
                color="inherit"
                iconKey="building"
                label="Go to Partners"
                component={RouterLink}
                to="/partnerships"
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen( false )}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Opened by a ResponsiveButton</Typography>
                    <ResponsiveButton
                        size="small"
                        variant="outlined"
                        color="inherit"
                        iconKey="close"
                        label="Close"
                        onClick={() => setDialogOpen( false )}
                    />
                </Box>
            </Dialog>
        </Box>
    );
}

export function CollectionToolbarPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>CollectionToolbar</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Search, filter, sort and paging for any collection, all driven by one
                <code> useCollection</code>. The controls report intent only — the pipeline
                does the work, so the same controls drive a table, a card grid or a grouped
                view. Filtering resets to page 1, and paging is clamped so a shrinking
                result set never strands the view on an empty page.
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Full width
            </Typography>
            <ToolbarDemo />

            <Divider sx={{ my: 4 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Contracted — as when the detail panel is open
            </Typography>
            {/* Demo override: single-select with checkboxes and no icons, so choosing one replaces the other. */}
            <ToolbarDemo width={420} filterShowCheckbox filterMultiSelect={false} />

            <Divider sx={{ my: 4 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Sectioned filter menu — scope, section, header and footer slots
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 680 }}>
                The header slot holds a search field and an "Active only" switch, which starts
                on. The Partnerships options have checkboxes, a section header and icons, and
                ticking two of them means either. Type in the search to narrow the section — the
                keystrokes must stay in the field. Clear all in the footer turns everything off.
            </Typography>
            <SectionedFilterDemo />

            <Divider sx={{ my: 4 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                ResponsiveButton — one component, any behaviour
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 680 }}>
                Action, modal trigger and router link. Narrow the window to see every one
                collapse to its icon at the same breakpoint.
            </Typography>
            <BehaviourDemo />
        </Box>
    );
}

export default CollectionToolbarPlayground;
