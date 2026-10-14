/**
 * LocationView
 *
 * The same locations as either a map or a list. A renderer, like `DataTable`:
 * it draws what it is given and reports the user's intent, so the caller's
 * collection pipeline stays the only owner of search, sort and paging.
 *
 * Two values, kept independent: `mode` is presentation, `focusPinId` is
 * selection. Neither changes the other here — selecting a location never
 * switches the view, and switching the view never clears the selection.
 *
 * @example
 * ```tsx
 * <LocationView
 *     mode={mode}
 *     pins={mode === 'list' ? collection.visibleRows : pins}
 *     columns={COLUMNS}
 *     height={320}
 *     emptyMessage="pages.company.location.empty"
 *     focusPinId={focusPinId}
 *     onPinSelect={pin => setFocusPinId( pin.id )}
 * />
 * ```
 */

import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui';
import { DataTable } from '@/components/tables';
import type { MapPin } from '@/services/map/map';
import { MapView } from './MapView';
import type { LocationViewProps } from './LocationView.types';

export function LocationView( {
    mode,
    pins,
    columns,
    height,
    emptyMessage,
    isLoading = false,
    sortKey,
    sortDir,
    onSortChange,
    focusPinId,
    onPinSelect,
}: LocationViewProps )
{
    const { t } = useTranslation();

    if( mode === 'map' )
    {
        return (
            <MapView
                pins={pins}
                height={height}
                focusPinId={focusPinId}
                onPinClick={onPinSelect}
                emptyState={
                    <Typography variant="body2" color="text.secondary">
                        {t( emptyMessage )}
                    </Typography>
                }
            />
        );
    }

    return (
        <DataTable<MapPin>
            columns={columns}
            rows={pins}
            getRowId={pin => pin.id}
            selectedRowId={focusPinId}
            onRowClick={onPinSelect}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={onSortChange}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            stickyHeader={false}
        />
    );
}

export default LocationView;
