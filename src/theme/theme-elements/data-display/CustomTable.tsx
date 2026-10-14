import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    type TableProps,
    type TableBodyProps,
    type TableCellProps,
    type TableContainerProps,
    type TableHeadProps,
    type TableRowProps,
    type TableSortLabelProps,
} from '@mui/material';

export const CustomTable = ( props: TableProps ) => <Table {...props} />;
export const CustomTableBody = ( props: TableBodyProps ) => <TableBody {...props} />;
export const CustomTableCell = ( props: TableCellProps ) => <TableCell {...props} />;
export const CustomTableContainer = ( props: TableContainerProps ) => <TableContainer {...props} />;
export const CustomTableHead = ( props: TableHeadProps ) => <TableHead {...props} />;
export const CustomTableRow = ( props: TableRowProps ) => <TableRow {...props} />;
export const CustomTableSortLabel = ( props: TableSortLabelProps ) => <TableSortLabel {...props} />;

export type {
    TableProps,
    TableBodyProps,
    TableCellProps,
    TableContainerProps,
    TableHeadProps,
    TableRowProps,
    TableSortLabelProps,
};
