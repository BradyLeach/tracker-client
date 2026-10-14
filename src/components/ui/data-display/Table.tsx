/**
 * Table primitives — App UI layer wrappers
 *
 * Layer 2: Thin wrappers over theme-elements
 * Provides stable import surface for app code
 */
import {
    CustomTable,
    CustomTableBody,
    CustomTableCell,
    CustomTableContainer,
    CustomTableHead,
    CustomTableRow,
    CustomTableSortLabel,
    type TableProps as CustomTableProps,
    type TableBodyProps as CustomTableBodyProps,
    type TableCellProps as CustomTableCellProps,
    type TableContainerProps as CustomTableContainerProps,
    type TableHeadProps as CustomTableHeadProps,
    type TableRowProps as CustomTableRowProps,
    type TableSortLabelProps as CustomTableSortLabelProps,
} from '@/theme/theme-elements/data-display/CustomTable';

export type TableProps = CustomTableProps;
export type TableBodyProps = CustomTableBodyProps;
export type TableCellProps = CustomTableCellProps;
export type TableContainerProps = CustomTableContainerProps;
export type TableHeadProps = CustomTableHeadProps;
export type TableRowProps = CustomTableRowProps;
export type TableSortLabelProps = CustomTableSortLabelProps;

export function Table( props: TableProps )
{
    return <CustomTable {...props} />;
}

export function TableBody( props: TableBodyProps )
{
    return <CustomTableBody {...props} />;
}

export function TableCell( props: TableCellProps )
{
    return <CustomTableCell {...props} />;
}

export function TableContainer( props: TableContainerProps )
{
    return <CustomTableContainer {...props} />;
}

export function TableHead( props: TableHeadProps )
{
    return <CustomTableHead {...props} />;
}

export function TableRow( props: TableRowProps )
{
    return <CustomTableRow {...props} />;
}

export function TableSortLabel( props: TableSortLabelProps )
{
    return <CustomTableSortLabel {...props} />;
}
