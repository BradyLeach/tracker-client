import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/data-display/Skeleton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@/components/ui/data-display/Table';
import { DataTableRow } from './DataTableRow';
import { getDefaultRenderer } from './utils/cellRenderers';
import type { DataTableProps } from './DataTable.types';

/**
 * DataTable
 *
 * Generic table component driven entirely by column configuration.
 * Column rendering is resolved from `TableColumnConfig.type` by default,
 * with per-column `render` overrides for custom output.
 *
 * A renderer, not a data owner. It draws the rows it is given, in the order
 * given, and never searches, filters or sorts — those belong to
 * `@/core/collection`. A sortable header only shows the current sort and
 * reports clicks through `onSortChange`.
 *
 * Columns with `visible: false` are silently excluded from rendering.
 * Shows skeleton rows while `isLoading` is true.
 *
 * @template T - The row data type.
 */
export function DataTable<T>(
    {
        columns,
        selectedRowId,
        rows,
        getRowId,
        onRowClick,
        sortKey,
        sortDir = 'asc',
        onSortChange,
        isLoading = false,
        stickyHeader = true,
        maxHeight,
        emptyMessage = 'No data yet.',
        getRowChangeNonce,
    }: DataTableProps<T>
)
{
    const { t } = useTranslation();

    const visibleColumns = useMemo( () => columns.filter( col => col.visible !== false ), [columns] );
    const renderers = useMemo( () => visibleColumns.map( col => getDefaultRenderer( col, t ) ), [visibleColumns, t] );

    const selectedRowSx = useMemo( () => ( {
        position: 'relative' as const,
        '&.Mui-selected': { backgroundColor: 'selected.bg' },
        '&.Mui-selected:hover': { backgroundColor: 'selected.bg' },
        '&.Mui-selected td:first-of-type::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 6,
            bottom: 6,
            width: 3,
            borderRadius: '0 2px 2px 0',
            backgroundColor: 'graphite',
        },
    } ), [] );

    return (
        <TableContainer
            sx={{
                // The table's header row shares a surface with whatever sits
                // above it — a section header, a card header — so it owns the
                // rule that separates them.
                borderTop: '1px solid',
                borderColor: 'border.base',
                ...( maxHeight ? { maxHeight, overflow: 'auto' } : {} ),
            }}
        >
            <Table stickyHeader={stickyHeader}>
                <TableHead>
                    <TableRow>
                        {visibleColumns.map( col => (
                            <TableCell
                                key={col.key}
                                align={col.align}
                                width={col.width}
                                // Emits aria-sort; the arrow alone is invisible
                                // to a screen reader.
                                sortDirection={sortKey === col.key ? sortDir : false}
                            >
                                {col.sortable && onSortChange
                                    ? (
                                        <TableSortLabel
                                            active={sortKey === col.key}
                                            direction={sortKey === col.key ? sortDir : 'asc'}
                                            onClick={() => onSortChange( col.key )}
                                        >
                                            {t( col.label )}
                                        </TableSortLabel>
                                    )
                                    : t( col.label )
                                }
                            </TableCell>
                        ) )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading
                        ? Array.from( { length: 5 } ).map( ( _, i ) => (
                            <TableRow key={i}>
                                {visibleColumns.map( col => (
                                    <TableCell key={col.key}><Skeleton /></TableCell>
                                ) )}
                            </TableRow>
                        ) )
                        : rows.length === 0
                            ? (
                                <TableRow>
                                    <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                        {t( emptyMessage )}
                                    </TableCell>
                                </TableRow>
                            )
                            : rows.map( row =>
                            {
                                const rowId = getRowId( row );
                                return (
                                    <DataTableRow
                                        key={rowId}
                                        rowId={rowId}
                                        selected={selectedRowId === rowId}
                                        clickable={!!onRowClick}
                                        onClick={onRowClick ? () => onRowClick( row ) : undefined}
                                        changeNonce={getRowChangeNonce?.( row )}
                                        selectedSx={selectedRowSx}
                                    >
                                        {visibleColumns.map( ( col, i ) => (
                                            <TableCell key={col.key} align={col.align}>
                                                {renderers[i]( row )}
                                            </TableCell>
                                        ) )}
                                    </DataTableRow>
                                );
                            } )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
