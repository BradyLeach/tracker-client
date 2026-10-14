/**
 * GroupedDataTable
 *
 * Grouped, expandable table inspired by Monday.com's board view.
 *
 * Structure (2 companies, both expanded):
 *
 *   OUTER TABLE — one row per group
 *   ──────────────────────────────────────────────────────────────────
 *   COMPANY                                              STATUS
 *   ▼ Company A  [2]                                    [Active]
 *     ┌ INNER TABLE — inset, own column grid ────────────────────────
 *     │ Type     Contact Name   Contact Email   Rating   State
 *     │ Supplier Sarah M.       sarah@...        ★★★★★   Active
 *     │ Logistics Sarah M.      sarah@...        ★★★☆☆   Ended
 *     └──────────────────────────────────────────────────────────────
 *   ▼ Company B  [1]                                    [Inactive]
 *     └ ...
 *
 * Key design decision:
 *   The outer table has only 1 + N columns (label + one per rollup key).
 *   The inner table is a fully independent nested <Table> inside a colSpan cell.
 *   This means inner columns are NOT constrained to outer column widths — they
 *   can use their own natural widths, exactly like Monday.com's sub-item grid.
 *
 * A renderer, like DataTable. It neither groups nor sorts — groups arrive
 * derived by `groupRows` and ordered by the collection pipeline.
 *
 * Expand/collapse stays here: which groups are open is view state.
 */

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GROUP_LABEL_KEY } from '@/core/collection';
import { Box } from '@/components/ui/layout';
import { Typography } from '@/components/ui/typography';
import { Chip } from '@/components/ui/data-display/Chip';
import { Collapse } from '@/components/ui/data-display/Collapse';
import { Skeleton } from '@/components/ui/data-display/Skeleton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@/components/ui/data-display/Table';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { getDefaultRenderer } from './utils/cellRenderers';
import type { GroupedDataTableProps } from './GroupedDataTable.types';

// ─── Component ────────────────────────────────────────────────────────────────

export function GroupedDataTable<TRow>(
    {
        config,
        groups,
        getRowId,
        onRowClick,
        sortKey,
        sortDir = 'asc',
        onSortChange,
        isLoading = false,
        maxHeight,
        renderGroupContent,
        renderChildContent,
        rollups,
        groupAccentColor: _groupAccentColor,
        headerActions,
    }: GroupedDataTableProps<TRow>
)
{
    const { t } = useTranslation();
    const {
        groupHeaderLabel,
        childColumns,
        defaultExpanded = false,
        emptyMessage = 'No data yet.',
        childSectionLabel,
    } = config;

    // ── Expand state — synced with group changes ───────────────────────────────

    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
        () => new Set( defaultExpanded ? groups.map( g => g.key ) : [] )
    );

    useEffect( () =>
    {
        setExpandedKeys( prev =>
        {
            const currentKeys = new Set( groups.map( g => g.key ) );
            const next = new Set( prev );
            let changed = false;

            for( const group of groups )
            {
                if( !prev.has( group.key ) && defaultExpanded )
                {
                    next.add( group.key );
                    changed = true;
                }
            }

            for( const key of next )
            {
                if( !currentKeys.has( key ) )
                {
                    next.delete( key );
                    changed = true;
                }
            }

            return changed ? next : prev;
        } );
    }, [groups, defaultExpanded] );

    const toggle = ( key: string ) =>
        setExpandedKeys( prev =>
        {
            const next = new Set( prev );
            next.has( key ) ? next.delete( key ) : next.add( key );
            return next;
        } );

    // ── Column derived data ───────────────────────────────────────────────────

    const visibleColumns = useMemo(
        () => childColumns.filter( col => col.visible !== false ),
        [childColumns]
    );
    const renderers = useMemo(
        () => visibleColumns.map( col => getDefaultRenderer( col, t ) ),
        [visibleColumns, t]
    );

    const rollupEntries = useMemo( () => Object.entries( rollups ?? {} ), [rollups] );

    // Outer table has 1 label column + one column per rollup key
    const outerColSpan = 1 + rollupEntries.length;

    const childColumnByKey = useMemo(
        () => Object.fromEntries( visibleColumns.map( c => [c.key, c] ) ),
        [visibleColumns]
    );

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if( isLoading )
    {
        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={outerColSpan}><Skeleton /></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.from( { length: 6 } ).map( ( _, i ) => (
                            <TableRow key={i}>
                                <TableCell colSpan={outerColSpan}><Skeleton /></TableCell>
                            </TableRow>
                        ) )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // ── Empty state ───────────────────────────────────────────────────────────

    if( groups.length === 0 )
    {
        return (
            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={outerColSpan}
                                align="center"
                                sx={{ py: 6, color: 'text.secondary' }}
                            >
                                {t( emptyMessage )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // ── Column width computation ──────────────────────────────────────────────

    const N = visibleColumns.length;
    const R = rollupEntries.length;
    const colWidthPct = `${100 / N}%`;
    const labelWidthPct = `${( N - R ) * 100 / N}%`;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <TableContainer
            sx={( theme ) => ( {
                bgcolor: 'groupedTable.containerBg',
                ...( maxHeight && { maxHeight, overflow: 'auto' } ),
                '& .MuiTableCell-root.MuiTableCell-stickyHeader': {
                    backgroundColor: theme.palette.groupedTable.headerBg,
                },
            } )}
        >
            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>

                {/* ── Outer top header: group dimension + rollup labels ── */}
                <TableHead>
                    <TableRow sx={{ bgcolor: 'groupedTable.headerBg' }}>
                        <TableCell
                            sortDirection={sortKey === GROUP_LABEL_KEY ? sortDir : false}
                            sx={{ fontWeight: 700, width: labelWidthPct, bgcolor: 'groupedTable.headerBg', borderBottomColor: 'groupedTable.border' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {headerActions}
                                {onSortChange
                                    ? (
                                        <TableSortLabel
                                            active={sortKey === GROUP_LABEL_KEY}
                                            direction={sortKey === GROUP_LABEL_KEY ? sortDir : 'asc'}
                                            onClick={() => onSortChange( GROUP_LABEL_KEY )}
                                        >
                                            {t( groupHeaderLabel )}
                                        </TableSortLabel>
                                    )
                                    : t( groupHeaderLabel )
                                }
                            </Box>
                        </TableCell>
                        {rollupEntries.map( ( [key] ) =>
                        {
                            const col = childColumnByKey[key];
                            return (
                                <TableCell
                                    key={key}
                                    align={col?.align ?? 'left'}
                                    sortDirection={sortKey === key ? sortDir : false}
                                    sx={{ fontWeight: 700, width: colWidthPct, bgcolor: 'groupedTable.headerBg', borderBottomColor: 'groupedTable.border' }}
                                >
                                    {onSortChange
                                        ? (
                                            <TableSortLabel
                                                active={sortKey === key}
                                                direction={sortKey === key ? sortDir : 'asc'}
                                                onClick={() => onSortChange( key )}
                                            >
                                                {col ? t( col.label ) : ''}
                                            </TableSortLabel>
                                        )
                                        : ( col ? t( col.label ) : '' )
                                    }
                                </TableCell>
                            );
                        } )}
                    </TableRow>
                </TableHead>

                {/* ── One TableBody per group ── */}
                {groups.map( ( group ) =>
                {
                    const isExpanded = expandedKeys.has( group.key );

                    return (
                        <TableBody key={group.key}>
                            {/* Group summary row */}
                            <TableRow
                                sx={{
                                    height: 44,
                                    bgcolor: isExpanded ? 'groupedTable.parentBgExpanded' : 'groupedTable.parentBg',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'groupedTable.rowHoverBg' },
                                }}
                                onClick={() => toggle( group.key )}
                            >
                                <TableCell sx={{
                                    p: renderGroupContent ? 0 : 1,
                                    borderBottom: '1px solid',
                                    borderTop: '1px solid',
                                    borderColor: 'groupedTable.border',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1.5 }}>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                transition: 'transform 0.2s ease',
                                            }}
                                        >
                                            <IconRenderer iconKey="chevronDown" width={16} />
                                        </Box>
                                        {renderGroupContent
                                            ? renderGroupContent( group.rows, group.key, group.label )
                                            : <Box component="span" sx={{ fontWeight: 600, fontSize: 13 }}>{group.label}</Box>
                                        }
                                        {!renderGroupContent && (
                                            <Chip
                                                label={group.rows.length}
                                                size="small"
                                                sx={{ height: 'auto', fontSize: '0.6875rem', fontWeight: 500, borderRadius: '4px', '& .MuiChip-label': { padding: '1.5px 6px' } }}
                                            />
                                        )}
                                    </Box>
                                </TableCell>

                                {rollupEntries.map( ( [key, rollupFn] ) => (
                                    <TableCell
                                        key={key}
                                        align={childColumnByKey[key]?.align ?? 'center'}
                                        sx={{
                                            py: 1,
                                            borderBottom: '1px solid',
                                            borderTop: '1px solid',
                                            borderColor: 'groupedTable.border',
                                        }}
                                    >
                                        {rollupFn( group.rows, group.key ).node}
                                    </TableCell>
                                ) )}
                            </TableRow>

                            {/* Expanded: inset sub-panel with header */}
                            <TableRow sx={{ bgcolor: 'groupedTable.childContainerBg' }}>
                                <TableCell
                                    colSpan={outerColSpan}
                                    sx={{ p: 0, borderBottom: 'none' }}
                                >
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <Box sx={{
                                            ml: { sm: 8, md: 10 },
                                            m: 2,
                                            bgcolor: 'groupedTable.childRowBg',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'groupedTable.border',
                                            overflow: 'hidden',
                                        }}>
                                            {childSectionLabel && (
                                                <Box sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    borderRadius: 0,
                                                    bgcolor: 'groupedTable.childHeaderBg',
                                                }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {t( childSectionLabel )}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {renderChildContent
                                                ? (
                                                    <Box sx={{ borderRadius: 0 }}>
                                                        {group.rows.map( ( row, ri ) => (
                                                            <Box
                                                                key={getRowId( row )}
                                                                onClick={() => onRowClick?.( row )}
                                                                sx={{ cursor: onRowClick ? 'pointer' : 'default', borderRadius: 0 }}
                                                            >
                                                                {renderChildContent( row, ri )}
                                                            </Box>
                                                        ) )}
                                                    </Box>
                                                )
                                                : (
                                                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <TableBody>
                                                            {group.rows.map( ( row ) => (
                                                                <TableRow
                                                                    key={getRowId( row )}
                                                                    hover
                                                                    onClick={() => onRowClick?.( row )}
                                                                    sx={{
                                                                        height: 44,
                                                                        bgcolor: 'groupedTable.childRowBg',
                                                                        '& > td': { borderBottom: 'none !important' },
                                                                    }}
                                                                >
                                                                    {visibleColumns.map( ( col, ci ) => (
                                                                        <TableCell
                                                                            key={col.key}
                                                                            align={col.align}
                                                                            sx={{
                                                                                fontSize: 13,
                                                                                fontWeight: 400,
                                                                                width: col.width ?? colWidthPct,
                                                                                ...( ci === 0 && { pl: 6 } ),
                                                                            }}
                                                                        >
                                                                            {renderers[ci]( row )}
                                                                        </TableCell>
                                                                    ) )}
                                                                </TableRow>
                                                            ) )}
                                                        </TableBody>
                                                    </Table>
                                                )
                                            }
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    );
                } )}

            </Table>
        </TableContainer>
    );
}
