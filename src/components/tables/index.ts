/**
 * Data display components - App UI layer
 *
 * Stable import surface for data display primitives.
 */
export { DataTable } from './DataTable';
export { GroupedDataTable } from './GroupedDataTable';
export { tableColumnFactory } from './TableColumnFactory';
export { indexColumnsByKey, withLabel, promoteType } from './utils/columnHelpers';
export type { DataTableProps, Column, TableColumnConfig, TableColumnType, TableConfig } from './DataTable.types';
export type { GroupedTableConfig, GroupedDataTableProps, GroupedTableBehavior } from './GroupedDataTable.types';
export type {
    TableProps,
    TableBodyProps,
    TableCellProps,
    TableContainerProps,
    TableHeadProps,
    TableRowProps,
} from '../ui/data-display/';
