/**
 * LocationView Playground
 *
 * The renderer in the arrangement the company profile uses: the demo owns the
 * collection, the toolbar and pagination report intent, and `LocationView`
 * draws whichever presentation is selected.
 *
 * What to check here: selecting a row does NOT switch to the map, and the
 * selection is still there when the map is opened afterwards.
 */

import { useState } from 'react';
import { Box, Stack, Typography, Divider } from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import { CollectionPagination, CollectionToolbar } from '@/components/collection';
import { useCollection } from '@/core/collection';
import type { TableColumnConfig } from '@/components/tables';
import { LocationView, LocationViewToggle } from '@/components/shared/map';
import type { LocationViewMode, MapPin } from '@/components/shared/map';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// Seven pins against a page size of five, so the second page is reachable.

const PINS: MapPin[] = [
    { id: 'p1', lat: -31.9523, lng: 115.8613, label: 'Perth Warehouse', description: '12 Kewdale Rd, Perth WA', kind: 'location' },
    { id: 'p2', lat: -33.8688, lng: 151.2093, label: 'Sydney Head Office', description: '1 Market St, Sydney NSW', kind: 'address' },
    { id: 'p3', lat: -37.8136, lng: 144.9631, label: 'Melbourne Depot', description: '400 Docklands Dr, Melbourne VIC', kind: 'location' },
    { id: 'p4', lat: -27.4698, lng: 153.0251, label: 'Brisbane Billing', description: '55 Ann St, Brisbane QLD', kind: 'address' },
    { id: 'p5', lat: -34.9285, lng: 138.6007, label: 'Adelaide Store', description: '77 Rundle Mall, Adelaide SA', kind: 'location' },
    { id: 'p6', lat: -42.8821, lng: 147.3272, label: 'Hobart Pickup', description: '9 Salamanca Pl, Hobart TAS', kind: 'location' },
    { id: 'p7', lat: -12.4634, lng: 130.8456, label: 'Darwin Transit', description: '2 Mitchell St, Darwin NT', kind: 'address' },
];

const COLUMNS: TableColumnConfig<MapPin>[] = [
    { key: 'label', label: 'tables.location.columns.name', type: 'text', sortable: true },
    { key: 'description', label: 'tables.location.columns.address', type: 'text', sortable: true },
];

// ─── Playground ───────────────────────────────────────────────────────────────

function LocationDemo( { pins, label, width, height = 320 }: { pins: MapPin[]; label: string; width?: number; height?: number } )
{
    const [mode, setMode] = useState<LocationViewMode>( 'list' );
    const [focusPinId, setFocusPinId] = useState<string>();

    const collection = useCollection( pins, { fields: COLUMNS, pageSize: 5 } );

    const focused = pins.find( pin => pin.id === focusPinId );

    return (
        <Box sx={{ maxWidth: width }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                {label}
            </Typography>

            <ProfileSection
                title="Locations"
                action={
                    <CollectionToolbar
                        search={mode === 'list' ? collection.search : undefined}
                        onSearchChange={mode === 'list' ? collection.setSearch : undefined}
                        searchPlaceholder="collection.toolbar.search"
                        actions={<LocationViewToggle mode={mode} onModeChange={setMode} />}
                    />
                }
                disableBodyPadding
                bodyHeight={height}
                footer={
                    mode === 'list' && (
                        <CollectionPagination
                            page={collection.page}
                            pageCount={collection.pageCount}
                            totalCount={collection.totalCount}
                            pageSize={collection.pageSize}
                            onPageChange={collection.setPage}
                        />
                    )
                }
            >
                <LocationView
                    mode={mode}
                    pins={mode === 'list' ? collection.visibleRows : pins}
                    columns={COLUMNS}
                    height={height}
                    emptyMessage="pages.company.location.empty"
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    focusPinId={focusPinId}
                    onPinSelect={pin => setFocusPinId( current => current === pin.id ? undefined : pin.id )}
                />
            </ProfileSection>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                mode: {mode} · focused: {focused?.label ?? 'none'}
            </Typography>
        </Box>
    );
}

export function LocationViewPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>LocationView</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Two presentations of a <code>MapPin[]</code> behind one renderer. Search, sort
                and paging belong to the collection pipeline exactly as they do for a table.
                Mode is presentation and belongs to the section; the focused location is
                selection — neither changes the other.
            </Typography>

            <Stack spacing={4}>
                <LocationDemo pins={PINS} label="List and map — select a row, then open the map" />
                <Divider />
                <LocationDemo pins={[]} label="Empty — both modes" height={240} />
                <Divider />
                <LocationDemo pins={PINS} label="Narrow — as in the detail panel" width={460} height={300} />
            </Stack>

            <PlaygroundDataPreview
                title="MapPin[]"
                caption="The list sorts and searches label and description; the map styles by kind."
                data={PINS}
            />
        </Box>
    );
}

export default LocationViewPlayground;
