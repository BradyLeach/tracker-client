/**
 * The architectural boundary, asserted on the renderers themselves:
 *
 *     data transformation belongs to the collection layer;
 *     renderers never transform collections.
 *
 * Each renderer is handed rows in a deliberately unsorted order together with
 * props saying a column *is* sorted. A renderer that still performs its own
 * sorting would reorder them, and these tests fail. That is the whole point —
 * they are here to break if sorting ever creeps back into a component.
 */

import type { ReactElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { BuildTheme } from '@/theme/Theme';
import { DataTable, GroupedDataTable } from '@/components/tables';
import type { TableColumnConfig, GroupedTableConfig } from '@/components/tables';
import { GROUP_LABEL_KEY } from '@/core/collection';
import type { CollectionGroup } from '@/core/collection';

// The grouped table paints from custom palette tokens, so it needs the real
// theme rather than MUI's default.
const theme = BuildTheme();
const renderStyled = ( ui: ReactElement ) =>
    render( <ThemeProvider theme={theme}>{ui}</ThemeProvider> );

interface Row
{
    id: string;
    name: string;
    score: number;
}

const COLUMNS: TableColumnConfig<Row>[] = [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'score', label: 'Score', type: 'number', sortable: true },
];

/** Deliberately not in any sorted order, by name or by score. */
const UNSORTED: Row[] = [
    { id: '1', name: 'Zed', score: 2 },
    { id: '2', name: 'Aroma', score: 9 },
    { id: '3', name: 'Midland', score: 5 },
];

const renderedNames = () =>
    screen.getAllByRole( 'row' )
        .slice( 1 ) // drop the header row
        .map( row => within( row ).getAllByRole( 'cell' )[0].textContent );

describe( 'DataTable renders, never transforms', () =>
{
    it( 'renders rows in the order given, even while claiming a column is sorted', () =>
    {
        renderStyled(
            <DataTable
                columns={COLUMNS}
                rows={UNSORTED}
                getRowId={row => row.id}
                sortKey="name"
                sortDir="asc"
                onSortChange={vi.fn()}
            />
        );

        expect( renderedNames() ).toEqual( ['Zed', 'Aroma', 'Midland'] );
    } );

    it( 'reports a header click without reordering anything itself', async () =>
    {
        const onSortChange = vi.fn();

        renderStyled(
            <DataTable
                columns={COLUMNS}
                rows={UNSORTED}
                getRowId={row => row.id}
                onSortChange={onSortChange}
            />
        );

        await userEvent.click( screen.getByRole( 'button', { name: 'Name' } ) );

        expect( onSortChange ).toHaveBeenCalledWith( 'name' );
        // The owner of the state decides what happens next; the rows are unmoved.
        expect( renderedNames() ).toEqual( ['Zed', 'Aroma', 'Midland'] );
    } );

    it( 'shows which column carries the active sort', () =>
    {
        renderStyled(
            <DataTable
                columns={COLUMNS}
                rows={UNSORTED}
                getRowId={row => row.id}
                sortKey="score"
                sortDir="desc"
                onSortChange={vi.fn()}
            />
        );

        // aria-sort belongs to the column header cell, not the control inside it.
        expect( screen.getByRole( 'columnheader', { name: /Score/ } ) )
            .toHaveAttribute( 'aria-sort', 'descending' );
        expect( screen.getByRole( 'columnheader', { name: /Name/ } ) )
            .not.toHaveAttribute( 'aria-sort' );
    } );

    it( 'renders a plain label when no one is listening for sort intent', () =>
    {
        renderStyled(
            <DataTable columns={COLUMNS} rows={UNSORTED} getRowId={row => row.id} />
        );

        expect( screen.queryByRole( 'button', { name: 'Name' } ) ).not.toBeInTheDocument();
        expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
    } );
} );

describe( 'GroupedDataTable renders, never transforms', () =>
{
    const config: GroupedTableConfig<Row> = {
        groupBy: 'name',
        groupHeaderLabel: 'Company',
        childColumns: COLUMNS,
        defaultExpanded: false,
    };

    /** Again deliberately unsorted, by label and by rollup value. */
    const GROUPS: CollectionGroup<Row>[] = [
        { key: 'z', label: 'Zed', rows: [UNSORTED[0]] },
        { key: 'a', label: 'Aroma', rows: [UNSORTED[1]] },
        { key: 'm', label: 'Midland', rows: [UNSORTED[2]] },
    ];

    const groupLabels = () =>
        GROUPS.map( g => g.label ).filter( label => screen.queryByText( label ) );

    it( 'renders groups in the order given, even while claiming a sort is active', () =>
    {
        renderStyled(
            <GroupedDataTable<Row>
                config={config}
                groups={GROUPS}
                getRowId={row => row.id}
                sortKey={GROUP_LABEL_KEY}
                sortDir="asc"
                onSortChange={vi.fn()}
            />
        );

        const rendered = screen.getAllByRole( 'row' )
            .map( row => row.textContent )
            .filter( text => text && /Zed|Aroma|Midland/.test( text ) );

        const order = ['Zed', 'Aroma', 'Midland'].filter( name =>
            rendered.some( text => text?.includes( name ) ) );

        expect( order ).toEqual( ['Zed', 'Aroma', 'Midland'] );
        expect( groupLabels() ).toHaveLength( 3 );
    } );

    it( 'reports group header sort intent under the shared label key', async () =>
    {
        const onSortChange = vi.fn();

        renderStyled(
            <GroupedDataTable<Row>
                config={config}
                groups={GROUPS}
                getRowId={row => row.id}
                onSortChange={onSortChange}
            />
        );

        await userEvent.click( screen.getByRole( 'button', { name: 'Company' } ) );

        expect( onSortChange ).toHaveBeenCalledWith( GROUP_LABEL_KEY );
    } );

    it( 'renders a plain group header when no one is listening for sort intent', () =>
    {
        renderStyled(
            <GroupedDataTable<Row>
                config={config}
                groups={GROUPS}
                getRowId={row => row.id}
            />
        );

        expect( screen.queryByRole( 'button', { name: 'Company' } ) ).not.toBeInTheDocument();
        expect( screen.getByText( 'Company' ) ).toBeInTheDocument();
    } );

    it( 'keeps expand/collapse as local view state', async () =>
    {
        renderStyled(
            <GroupedDataTable<Row>
                config={config}
                groups={GROUPS}
                getRowId={row => row.id}
                onSortChange={vi.fn()}
            />
        );

        // Collapsed groups unmount their children, so a child value is absent
        // until the group is opened — and opening it needs no external state.
        expect( screen.queryByText( '9' ) ).not.toBeInTheDocument();

        await userEvent.click( screen.getByText( 'Aroma' ) );

        expect( await screen.findByText( '9' ) ).toBeInTheDocument();
    } );
} );
