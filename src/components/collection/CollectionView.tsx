/**
 * CollectionView
 *
 * The same rows as either a table or a grid of cards. A renderer, like
 * `DataTable`: it draws what it is given and reports the user's intent, so the
 * caller's collection pipeline stays the only owner of search, sort and paging.
 *
 * One column config drives both modes. The table renders a cell per column; the
 * card reads each column's `card` slot and falls back to the body. Nothing about
 * a row is described twice.
 *
 * `mode` is presentation and `selectedRowId` is selection — neither changes the
 * other, so switching the view never clears what is selected.
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useState<CollectionViewMode>( 'card' );
 * const collection = useCollection( rows, { fields: columns } );
 *
 * <CollectionViewToggle mode={mode} onModeChange={setMode} />
 *
 * <CollectionView
 *     mode={mode}
 *     rows={collection.visibleRows}
 *     columns={columns}
 *     getRowId={row => row.id}
 *     selectedRowId={selectedId}
 *     onRowClick={row => setSelectedId( row.id )}
 *     sortKey={collection.sortKey}
 *     sortDir={collection.sortDir}
 *     onSortChange={collection.toggleSort}
 * />
 * ```
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Skeleton, Typography } from '@/components/ui';
import { groupRows } from '@/core/collection';
import { DataTable } from '@/components/tables';
import { get, getDefaultRenderer } from '@/components/tables/utils/cellRenderers';
import { RecordCard } from '@/components/shared/records';
import { logger } from '@/core/utils';
import type { TableColumnConfig } from '@/components/tables';
import type { CollectionViewProps } from './CollectionView.types';

/**
 * Intrinsic, not breakpoint-driven. Viewport breakpoints cannot see a detail
 * panel beside the grid, so `auto-fill` measures the grid's own width and one
 * rule accounts for the panel, the rail and the viewport alike.
 */
const DEFAULT_MIN_CARD_WIDTH = 420;

/** Enough to fill a first screen without guessing at the real count. */
const SKELETON_COUNT = 6;

const SKELETON_HEIGHT = 184;

/** The column that declared the slot, if any. */
function columnForSlot<TRow>(
    columns: TableColumnConfig<TRow>[],
    slot: 'title' | 'subtitle',
): TableColumnConfig<TRow> | undefined
{
    return columns.find( column => column.card === slot );
}

/**
 * The card's title as text.
 *
 * A column's `render` returns a node, which suits a cell and not a heading: the
 * title is also the truncation tooltip and the initials a tile falls back to, so
 * it reads the stored value.
 */
function titleOf<TRow>( row: TRow, column: TableColumnConfig<TRow> | undefined ): string
{
    if( !column ) return '';

    const value = get( row as Record<string, unknown>, column.key );
    return value == null ? '' : String( value );
}

export function CollectionView<TRow>( {
    mode,
    rows,
    columns,
    getRowId,
    onRowClick,
    selectedRowId,
    sortKey,
    sortDir,
    onSortChange,
    isLoading = false,
    emptyState,
    emptyMessage = 'collection.noMatches',
    isEmpty = false,
    getRowChangeNonce,
    minCardWidth = DEFAULT_MIN_CARD_WIDTH,
    metrics,
    groupBy,
    groupLabel,
}: CollectionViewProps<TRow> )
{
    const { t } = useTranslation();

    const visibleColumns = useMemo(
        () => columns.filter( column => column.visible !== false ),
        [columns],
    );

    /**
     * Resolved once per column set rather than per row. Cards and the table share
     * the renderers, so a value prints identically whichever mode drew it.
     */
    const cardSlots = useMemo( () =>
    {
        // Declared, never inferred. Falling back to the first column would tie a
        // card's heading to table order, and reordering columns would silently
        // retitle every card.
        const title = columnForSlot( visibleColumns, 'title' );
        const subtitle = columnForSlot( visibleColumns, 'subtitle' );

        // Declared, not left over. A table carries columns a card has no room for,
        // and the two views answer different questions — scanning on a phone versus
        // reading the whole record — so a card shows what it was given and nothing
        // that merely happened to be in the config.
        const body = visibleColumns.filter( column => column.card === 'body' );

        if( import.meta.env.DEV && !title )
        {
            logger.warn( 'CollectionView: no column declares card: \'title\'; cards render without a heading' );
        }

        return {
            title,
            subtitle,
            body,
            renderSubtitle: subtitle ? getDefaultRenderer( subtitle, t ) : undefined,
            renderBody: body.map( column => getDefaultRenderer( column, t ) ),
        };
    }, [visibleColumns, t] );

    /** Metrics belong above the collection in every state, so one wrapper carries them. */
    const withMetrics = ( content: ReactNode ) => (
        <>
            {metrics && <Box sx={{ mb: 3 }}>{metrics}</Box>}
            {content}
        </>
    );

    // A collection with nothing in it is the caller's to speak to — it knows what
    // the records are and how one gets added. A collection a filter has emptied is
    // not, and says so below in either mode.
    if( isEmpty && !isLoading && emptyState ) return withMetrics( emptyState );

    const gridColumns = `repeat(auto-fill, minmax(min(100%, ${minCardWidth}px), 1fr))`;

    /** One set of rows, drawn in the current mode. A group's body and a flat collection are the same thing. */
    const renderRows = ( rowsToDraw: TRow[] ) =>
    {
        if( mode === 'table' )
        {
            return (
                // A page's own collection sits under rounded controls, so its top edge takes the
                // same radius. Clip rather than hide, which would break the sticky header.
                <Box
                    sx={{
                        borderRadius: theme => `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
                        overflow: 'clip',
                    }}
                >
                    <DataTable<TRow>
                        columns={columns}
                        rows={rowsToDraw}
                        getRowId={getRowId}
                        onRowClick={onRowClick}
                        selectedRowId={selectedRowId}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSortChange={onSortChange}
                        isLoading={isLoading}
                        emptyMessage={emptyMessage}
                        getRowChangeNonce={getRowChangeNonce}
                    />
                </Box>
            );
        }

        if( isLoading )
        {
            return (
                <Box sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 2, alignItems: 'start' }}>
                    {Array.from( { length: SKELETON_COUNT } ).map( ( _, index ) => (
                        <Skeleton key={index} variant="rectangular" height={SKELETON_HEIGHT} sx={{ borderRadius: 1 }} />
                    ) )}
                </Box>
            );
        }

        if( rowsToDraw.length === 0 )
        {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                    {t( emptyMessage )}
                </Typography>
            );
        }

        return (
            <Box sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 2, alignItems: 'start' }}>
                {rowsToDraw.map( row =>
                {
                    const rowId = getRowId( row );

                    return (
                        <RecordCard
                            key={rowId}
                            // The card's title is text, not a cell: it is also the
                            // truncation tooltip and the icon tile's initials, so it
                            // reads the raw value rather than a rendered node.
                            title={titleOf( row, cardSlots.title )}
                            subtitle={cardSlots.renderSubtitle?.( row )}
                            selected={selectedRowId === rowId}
                            onClick={onRowClick ? () => onRowClick( row ) : undefined}
                            realtimeTrigger={getRowChangeNonce?.( row )}
                        >
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                // Fills the content row so the last value sits against
                                // the card's edge rather than against its neighbour.
                                flex: 1,
                                minWidth: 0,
                            }}>
                                {cardSlots.body.map( ( column, index ) =>
                                {
                                    const value = cardSlots.renderBody[index]( row );

                                    // Text truncates to hold the row on one line. A component
                                    // draws unclipped, as it does in a table cell, so anything
                                    // it places past its own box — a count badge — stays visible.
                                    const isText = typeof value === 'string' || typeof value === 'number';

                                    return (
                                        <Typography
                                            key={column.key}
                                            component="div"
                                            variant="body2"
                                            color="text.secondary"
                                            noWrap={isText}
                                        >
                                            {value}
                                        </Typography>
                                    );
                                } )}
                            </Box>
                        </RecordCard>
                    );
                } )}
            </Box>
        );
    };

    if( !groupBy ) return withMetrics( renderRows( rows ) );

    // Partitioned after the pipeline, so a group holds the rows the search and the
    // sort already settled on and the order within it is the collection's own.
    const groups = groupRows( rows, groupBy, groupLabel );

    // One group is the collection itself: a heading over every row says nothing a
    // page title has not, so it is left off until there is something to tell apart.
    if( groups.length <= 1 ) return withMetrics( renderRows( rows ) );

    return withMetrics(
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {groups.map( group => (
                <Box key={group.key} component="section">
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: 11,
                            color: 'text.secondary',
                        }}
                    >
                        {t( group.label )} ({group.rows.length})
                    </Typography>
                    {renderRows( group.rows )}
                </Box>
            ) )}
        </Box>
    );
}
