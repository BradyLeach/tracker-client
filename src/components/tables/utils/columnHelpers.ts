/**
 * Column Config Helpers
 *
 * Utilities for domain config builders to select, label, and promote
 * columns derived from TableColumnFactory.
 *
 * Every config builder follows the same pattern:
 *   1. Get columns from factory
 *   2. Index by key via indexColumnsByKey
 *   3. Select, override labels via withLabel, promote types via promoteType
 *   4. Filter and return
 */

import type { TableColumnConfig, TableColumnType } from '../DataTable.types';

/**
 * Index an array of columns by their key for O(1) lookup.
 *
 * @example
 * const byKey = indexColumnsByKey<Partnership>( tableColumnFactory.getTableColumns( 'partnership' ) );
 * byKey['contactName'] // → TableColumnConfig<Partnership> | undefined
 */
export function indexColumnsByKey<T>( columns: TableColumnConfig<T>[] ): Record<string, TableColumnConfig<T>>
{
    return Object.fromEntries( columns.map( c => [c.key, c] ) );
}

/**
 * Override a column's label with an explicit i18n key.
 * Used in config builders to replace factory-generated labels with translation keys.
 *
 * @example
 * withLabel( byKey['contactName'], 'tables.partnerships.columns.contactName' )
 */
export function withLabel<T>( col: TableColumnConfig<T>, labelKey: string ): TableColumnConfig<T>
{
    return { ...col, label: labelKey };
}

/**
 * Promote a column to a different display type.
 * Used when the factory's inferred type is correct for storage but needs
 * a richer renderer — e.g. promoting an integer field to 'rating'.
 *
 * @example
 * promoteType( byKey['rating'], 'rating' )
 */
export function promoteType<T>( col: TableColumnConfig<T>, type: TableColumnType ): TableColumnConfig<T>
{
    return { ...col, type };
}
