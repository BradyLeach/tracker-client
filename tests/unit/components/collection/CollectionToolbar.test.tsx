/**
 * CollectionToolbar filter menu Unit Tests
 *
 * Driven through a real useCollection, so the toolbar reports intent and the
 * pipeline decides what it means — the same wiring a page uses. Asserted on what
 * the user sees: which options are ticked, whether the menu is still open, and
 * where focus is while typing in a slot.
 */

import { describe, it, expect } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { CollectionToolbar } from '@/components/collection';
import type { CollectionFilterOption, CollectionToolbarProps } from '@/components/collection';
import { useCollection } from '@/core/collection';
import type { CollectionFilter } from '@/core/collection';

interface Row
{
    id: string;
    partners: number;
}

const ROWS: Row[] = [
    { id: '1', partners: 0 },
    { id: '2', partners: 1 },
    { id: '3', partners: 3 },
];

const OPTIONS: CollectionFilterOption[] = [
    { key: 'none', label: 'No partnerships' },
    { key: 'one', label: 'One partnership' },
    { key: 'several', label: 'Several partnerships' },
];

const FILTERS: CollectionFilter<Row>[] = [
    { key: 'none', group: 'partners', predicate: row => row.partners === 0 },
    { key: 'one', group: 'partners', predicate: row => row.partners === 1 },
    { key: 'several', group: 'partners', predicate: row => row.partners > 1 },
];

function Harness( props: Partial<CollectionToolbarProps> )
{
    const collection = useCollection( ROWS, { filters: FILTERS } );

    return (
        <CollectionToolbar
            filterOptions={OPTIONS}
            activeFilterKeys={collection.activeFilterKeys}
            onFilterToggle={collection.toggleFilter}
            filterShowCheckbox
            {...props}
        />
    );
}

function openFilterMenu()
{
    fireEvent.click( screen.getByRole( 'button', { name: 'collection.toolbar.filter' } ) );
    return screen.getByRole( 'menu' );
}

/** The checked state as assistive tech reads it: the row carries it, not the decorative checkbox. */
function isTicked( role: 'menuitemcheckbox' | 'menuitemradio', label: string )
{
    return screen.getByRole( role, { name: label } ).getAttribute( 'aria-checked' ) === 'true';
}

describe( 'CollectionToolbar filter menu', () =>
{
    it( 'replaces the previous choice when single-select', () =>
    {
        render( <Harness filterMultiSelect={false} /> );
        openFilterMenu();

        fireEvent.click( screen.getByRole( 'menuitemradio', { name: 'No partnerships' } ) );
        fireEvent.click( screen.getByRole( 'menuitemradio', { name: 'Several partnerships' } ) );

        expect( isTicked( 'menuitemradio', 'Several partnerships' ) ).toBe( true );
        expect( isTicked( 'menuitemradio', 'No partnerships' ) ).toBe( false );
    } );

    it( 'stays open after a choice, in single- and multi-select alike', () =>
    {
        const { unmount } = render( <Harness filterMultiSelect={false} /> );
        openFilterMenu();
        fireEvent.click( screen.getByRole( 'menuitemradio', { name: 'One partnership' } ) );
        expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();
        unmount();

        render( <Harness /> );
        openFilterMenu();
        fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'One partnership' } ) );
        fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Several partnerships' } ) );
        expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();
        expect( isTicked( 'menuitemcheckbox', 'One partnership' ) ).toBe( true );
        expect( isTicked( 'menuitemcheckbox', 'Several partnerships' ) ).toBe( true );
    } );

    it( 'keeps focus in a header field while typing, rather than jumping to a matching option', () =>
    {
        render( <Harness filterHeader={<input aria-label="Find option" />} /> );
        openFilterMenu();

        const field = screen.getByRole( 'textbox', { name: 'Find option' } );
        act( () => field.focus() );

        // "s" would move focus to "Several partnerships" if the menu saw the keystroke.
        fireEvent.keyDown( field, { key: 's' } );

        expect( field ).toHaveFocus();
    } );
} );
