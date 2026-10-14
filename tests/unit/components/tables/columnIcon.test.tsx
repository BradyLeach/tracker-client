/**
 * Column Icon Unit Tests
 *
 * A column with an `icon` draws the row's own icon in a tile beside its value, or the
 * column's generic one when the row's is missing or unknown. Asserted on what renders,
 * through the shared renderer every table uses.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { getDefaultRenderer } from '@/components/tables/utils/cellRenderers';
import type { TableColumnConfig } from '@/components/tables';

interface Row { id: string; name: string; kind?: { icon?: string } }

const NAME_COLUMN: TableColumnConfig<Row> = { key: 'name', label: 'tables.row.columns.name', type: 'text' };
const NAME_WITH_ICON: TableColumnConfig<Row> = { ...NAME_COLUMN, icon: { field: 'kind.icon', fallback: 'building' } };

/** The icon library names each svg `tabler-icon-<name>`. */
function renderedIcon( container: HTMLElement ): string | undefined
{
    const svg = container.querySelector( 'svg.tabler-icon' );
    return [...( svg?.classList ?? [] )].find( name => name !== 'tabler-icon' );
}

function renderCell( column: TableColumnConfig<Row>, row: Row )
{
    return render( <>{getDefaultRenderer( column, key => key )( row )}</> );
}

describe( 'column icon', () =>
{
    it( 'draws the row\'s own icon in a tile beside the value', () =>
    {
        const { container } = renderCell( NAME_WITH_ICON, { id: '1', name: 'Morely Store', kind: { icon: 'buildingStore' } } );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-building-store' );
        expect( container ).toHaveTextContent( 'Morely Store' );
    } );

    it( 'draws the column\'s generic icon when the row\'s is missing or unknown', () =>
    {
        const missing = renderCell( NAME_WITH_ICON, { id: '1', name: 'Morely Store' } );
        const unknown = renderCell( NAME_WITH_ICON, { id: '2', name: 'Morely Store', kind: { icon: 'nonesuch' } } );

        for( const { container } of [missing, unknown] )
        {
            expect( renderedIcon( container ) ).toBe( 'tabler-icon-building' );
            expect( container ).toHaveTextContent( 'Morely Store' );
        }
    } );

    it( 'wraps a column\'s own render as well as the type default', () =>
    {
        const { container } = renderCell(
            { ...NAME_WITH_ICON, render: row => `Site: ${row.name}` },
            { id: '1', name: 'Morely Store', kind: { icon: 'buildingStore' } }
        );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-building-store' );
        expect( container ).toHaveTextContent( 'Site: Morely Store' );
    } );

    it( 'requires a generic icon, so a tile can never be blank', () =>
    {
        // @ts-expect-error A column icon without a fallback does not compile.
        const missingFallback: TableColumnConfig<Row> = { ...NAME_COLUMN, icon: { field: 'kind.icon' } };

        expect( missingFallback.icon?.field ).toBe( 'kind.icon' );
    } );

    it( 'leaves a column without one unchanged', () =>
    {
        const { container } = renderCell( NAME_COLUMN, { id: '1', name: 'Morely Store', kind: { icon: 'buildingStore' } } );

        expect( container.querySelector( '.MuiAvatar-root' ) ).toBeNull();
        expect( container ).toHaveTextContent( 'Morely Store' );
    } );
} );
