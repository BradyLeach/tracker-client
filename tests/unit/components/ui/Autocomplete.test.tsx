/**
 * Autocomplete Icon Unit Tests
 *
 * Options may carry an icon registry key. Asserted on what renders: the chosen option's
 * icon leading the input, and each option's icon in the list. Options without icons render
 * as plain text, as before.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Autocomplete } from '@/components/ui/forms/Autocomplete';
import type { AutocompleteOption } from '@/components/ui/forms/Autocomplete';

const WITH_ICONS: AutocompleteOption[] = [
    { value: 'warehouse', label: 'Warehouse', icon: 'buildingWarehouse' },
    { value: 'retail', label: 'Retail', icon: 'buildingStore' },
];

const PLAIN: AutocompleteOption[] = [
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'retail', label: 'Retail' },
];

function openList()
{
    fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
    return screen.getByRole( 'listbox' );
}

describe( 'Autocomplete icons', () =>
{
    it( 'leads the input with the chosen option\'s icon', () =>
    {
        const { container } = render( <Autocomplete options={WITH_ICONS} value="retail" onChange={() => undefined} /> );

        const adornment = container.querySelector( '.MuiInputAdornment-root svg.tabler-icon' );
        expect( adornment?.classList.contains( 'tabler-icon-building-store' ) ).toBe( true );
    } );

    it( 'shows each option\'s icon beside its label in the list', () =>
    {
        render( <Autocomplete options={WITH_ICONS} value={null} onChange={() => undefined} /> );

        const options = within( openList() ).getAllByRole( 'option' );

        expect( options[0].querySelector( 'svg.tabler-icon-building-warehouse' ) ).not.toBeNull();
        expect( options[0] ).toHaveTextContent( 'Warehouse' );
        expect( options[1].querySelector( 'svg.tabler-icon-building-store' ) ).not.toBeNull();
    } );

    it( 'renders options without icons as plain text, with no adornment', () =>
    {
        const { container } = render( <Autocomplete options={PLAIN} value="retail" onChange={() => undefined} /> );

        expect( container.querySelector( '.MuiInputAdornment-root' ) ).toBeNull();

        const options = within( openList() ).getAllByRole( 'option' );
        expect( options[0].querySelector( 'svg' ) ).toBeNull();
        expect( options[0] ).toHaveTextContent( 'Warehouse' );
    } );
} );
