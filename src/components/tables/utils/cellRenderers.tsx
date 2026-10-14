/**
 * Shared cell renderer utilities for DataTable and GroupedDataTable.
 *
 * Extracted here so both table components use identical rendering logic
 * without duplicating code.
 */

import i18n from 'i18next';
import { stateRegistry } from '@/core/models/StateRegistry';
import { getPath } from '@/core/utils';
import { Box } from '@/components/ui/layout';
import { Avatar } from '@/components/ui/data-display/Avatar';
import { Chip } from '@/components/ui/data-display/Chip';
import { Rating } from '@/components/ui/data-display/Rating';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { StatusChip } from '@/components/shared/status';
import type { TableColumnConfig } from '../DataTable.types';
import type { ReactNode } from 'react';

/**
 * Dot-notation path resolver. Re-exported so cell rendering and the collection
 * pipeline read a column's value identically.
 */
export const get = getPath;

/** How each emphasis reads: the record's name stands out, supporting detail recedes. */
const EMPHASIS_SX = {
    primary: { fontWeight: 600, color: 'text.primary' },
    secondary: { color: 'text.secondary' },
} as const;

/**
 * Select the cell renderer for a column.
 *
 * Returns `column.render` if an explicit override is provided.
 * Otherwise falls back to a type-aware default renderer derived
 * from the column's `type` and supplementary config (options, max).
 *
 * A column with an `icon` draws it in a tile beside the value, whatever
 * the column's type or render. A column with an `emphasis` styles the value itself.
 *
 * @param col - The column config to resolve a renderer for.
 * @param t   - i18next translate function, used for enum labels.
 * @returns A function that accepts a row and returns a ReactNode.
 */
export function getDefaultRenderer<T>(
    col: TableColumnConfig<T>,
    t: ( key: string ) => string
): ( row: T ) => ReactNode
{
    const renderPlain = getValueRenderer( col, t );
    const { icon, emphasis } = col;

    const renderValue = emphasis
        ? ( row: T ): ReactNode => <Box component="span" sx={EMPHASIS_SX[emphasis]}>{renderPlain( row )}</Box>
        : renderPlain;

    if( !icon ) return renderValue;

    // The row's own icon, or the column's generic one when it is missing or unknown.
    return ( row: T ): ReactNode => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0 }}>
            <Avatar
                variant="rounded"
                sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    flexShrink: 0,
                    userSelect: 'none',
                    backgroundColor: 'iconTile.bg',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'border.base',
                }}
            >
                <IconRenderer
                    iconName={get( row as Record<string, unknown>, icon.field ) as string | undefined}
                    iconKey={icon.fallback}
                    size={18}
                />
            </Avatar>
            {renderValue( row )}
        </Box>
    );
}

/** The value itself: the column's own render, or the default for its type. */
function getValueRenderer<T>(
    col: TableColumnConfig<T>,
    t: ( key: string ) => string
): ( row: T ) => ReactNode
{
    if( col.render ) return col.render;

    return ( row: T ): ReactNode =>
    {
        const value = get( row as Record<string, unknown>, col.key );

        switch ( col.type )
        {
            case 'boolean':
                return (
                    <Chip
                        label={value ? 'Yes' : 'No'}
                        size="small"
                        color={value ? 'success' : 'default'}
                    />
                );

            case 'enum':
            {
                const option = col.options?.find( o => o.value === value );
                return (
                    <Chip
                        label={t( option?.label ?? String( value ?? '—' ) )}
                        size="small"
                        sx={{ borderRadius: '6px' }}
                    />
                );
            }

            case 'rating':
            {
                const n = value != null ? parseFloat( String( value ) ) : 0;
                const max = col.max ?? 5;
                return (
                    <Rating value={isNaN( n ) ? 0 : n} max={max} readOnly size="small" />
                );
            }

            case 'state':
            {
                const state = stateRegistry.getState( value as string );
                return (
                    <StatusChip
                        stateName={state && i18n.t( `states.${state.label}` )}
                        stateCategoryColour={state?.stateCategory?.color}
                    />
                );
            }

            case 'date':
            {
                if( value == null ) return '—';
                const d = new Date( value as string );
                return isNaN( d.getTime() ) ? String( value ) : d.toLocaleDateString();
            }

            default:
                return String( value ?? '—' );
        }
    };
}
