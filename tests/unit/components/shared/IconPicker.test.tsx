/**
 * IconPicker Unit Tests
 *
 * Driven the way a user drives it — click, arrow keys, Enter, Escape — and asserted on
 * focus, the value reported and what the trigger shows. Translation returns keys.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { IconPicker } from '@/components/shared/iconPicker';
import { ICONS } from '@/config/icons.config';
import type { IconDefinition, IconKey } from '@/config/icons.config';

vi.mock( 'react-i18next', () => ( {
    useTranslation: () => ( { t: ( key: string ) => key } ),
} ) );

beforeAll( () =>
{
    // jsdom has no layout, so scrolling an element into view is not implemented.
    Element.prototype.scrollIntoView = vi.fn();
} );

const TRIGGER_NAME = 'shared.iconPicker.choose';

function renderPicker( props: Partial<Parameters<typeof IconPicker>[0]> = {} )
{
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render( <IconPicker value="leaf" fallback="building" onChange={onChange} onBlur={onBlur} {...props} /> );

    return { onChange, onBlur, trigger: screen.getByRole( 'button', { name: TRIGGER_NAME } ) };
}

/** The icon the trigger's tile is showing. */
function triggerIcon( trigger: HTMLElement ): string | undefined
{
    const svg = trigger.querySelector( '.MuiAvatar-root svg.tabler-icon' );
    return [...( svg?.classList ?? [] )].find( name => name !== 'tabler-icon' );
}

async function openGrid( trigger: HTMLElement )
{
    fireEvent.click( trigger );
    await screen.findByRole( 'listbox' );
}

describe( 'IconPicker', () =>
{
    it( 'opens with focus on the current icon', async () =>
    {
        const { trigger } = renderPicker();

        await openGrid( trigger );

        await waitFor( () => expect( document.activeElement ).toHaveAttribute( 'aria-label', 'icons.leaf' ) );
        expect( document.activeElement ).toHaveAttribute( 'aria-selected', 'true' );
    } );

    it( 'moves focus one icon with left and right', async () =>
    {
        const { trigger } = renderPicker();
        await openGrid( trigger );
        await waitFor( () => expect( document.activeElement ).toHaveAttribute( 'aria-label', 'icons.leaf' ) );

        const options = screen.getAllByRole( 'option' );
        const start = options.indexOf( document.activeElement as HTMLElement );

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowRight' } );
        await waitFor( () => expect( document.activeElement ).toBe( options[start + 1] ) );

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowLeft' } );
        await waitFor( () => expect( document.activeElement ).toBe( options[start] ) );

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'Home' } );
        await waitFor( () => expect( document.activeElement ).toBe( options[0] ) );
    } );

    it( 'moves up and down within the same column, crossing groups at their edge row', async () =>
    {
        // The first group's second icon: column 1, top row.
        const { trigger } = renderPicker( { value: undefined } );
        await openGrid( trigger );

        const groups = screen.getAllByRole( 'group' ).map( group => within( group ).getAllByRole( 'option' ) );
        const [first, second] = groups;
        const columns = 8;
        const column = 1;
        const lastRowOf = ( options: HTMLElement[] ) => Math.floor( ( options.length - 1 ) / columns );
        const at = ( options: HTMLElement[], row: number ) => options[Math.min( row * columns + column, options.length - 1 )];

        await waitFor( () => expect( document.activeElement ).toBe( first[0] ) );
        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowRight' } );
        await waitFor( () => expect( document.activeElement ).toBe( first[column] ) );

        // Down through the first group's rows, then into the second group's top row.
        for( let row = 1; row <= lastRowOf( first ); row++ )
        {
            fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowDown' } );
            await waitFor( () => expect( document.activeElement ).toBe( at( first, row ) ) );
        }

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowDown' } );
        await waitFor( () => expect( document.activeElement ).toBe( at( second, 0 ) ) );

        // And back up into the first group's last row.
        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowUp' } );
        await waitFor( () => expect( document.activeElement ).toBe( at( first, lastRowOf( first ) ) ) );
    } );

    it( 'chooses with Enter, closes and returns focus to the trigger', async () =>
    {
        const { trigger, onChange } = renderPicker();
        await openGrid( trigger );
        await waitFor( () => expect( document.activeElement ).toHaveAttribute( 'aria-label', 'icons.leaf' ) );

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'ArrowRight' } );
        await waitFor( () => expect( document.activeElement ).not.toHaveAttribute( 'aria-label', 'icons.leaf' ) );
        const chosen = ( document.activeElement as HTMLElement ).getAttribute( 'aria-label' )?.replace( 'icons.', '' );

        fireEvent.keyDown( document.activeElement as HTMLElement, { key: 'Enter' } );

        expect( onChange ).toHaveBeenCalledWith( chosen );
        await waitFor( () => expect( screen.queryByRole( 'listbox' ) ).toBeNull() );
        await waitFor( () => expect( document.activeElement ).toBe( trigger ) );
    } );

    it( 'closes with Escape without changing the value', async () =>
    {
        const { trigger, onChange, onBlur } = renderPicker();
        await openGrid( trigger );

        fireEvent.keyDown( screen.getByRole( 'listbox' ), { key: 'Escape' } );

        await waitFor( () => expect( screen.queryByRole( 'listbox' ) ).toBeNull() );
        expect( onChange ).not.toHaveBeenCalled();
        expect( onBlur ).toHaveBeenCalled();
        await waitFor( () => expect( document.activeElement ).toBe( trigger ) );
    } );

    it( 'offers every icon outside the interface category, and nothing deprecated', async () =>
    {
        const { trigger } = renderPicker();
        await openGrid( trigger );

        const offered = ( Object.keys( ICONS ) as IconKey[] ).filter( key =>
        {
            const definition: IconDefinition = ICONS[key];
            return definition.category !== 'interface' && !definition.deprecated;
        } );

        expect( screen.getAllByRole( 'option' ) ).toHaveLength( offered.length );
    } );

    it( 'reports a blur when focus leaves the field without opening it', () =>
    {
        const { trigger, onBlur } = renderPicker();

        fireEvent.blur( trigger );

        expect( onBlur ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'does not report a blur while focus is inside the open grid', async () =>
    {
        const { trigger, onBlur } = renderPicker();
        await openGrid( trigger );
        await waitFor( () => expect( document.activeElement ).toHaveAttribute( 'role', 'option' ) );

        expect( onBlur ).not.toHaveBeenCalled();

        fireEvent.keyDown( screen.getByRole( 'listbox' ), { key: 'Escape' } );
        await waitFor( () => expect( onBlur ).toHaveBeenCalledTimes( 1 ) );
    } );

    it( 'cannot be opened when disabled', () =>
    {
        const { trigger } = renderPicker( { disabled: true } );

        expect( trigger ).toBeDisabled();
    } );

    it( 'shows the fallback for an unknown value and never replaces it on open or close', async () =>
    {
        const { trigger, onChange } = renderPicker( { value: 'shopping-cart' } );

        expect( triggerIcon( trigger ) ).toBe( 'tabler-icon-building' );

        await openGrid( trigger );
        fireEvent.keyDown( screen.getByRole( 'listbox' ), { key: 'Escape' } );
        await waitFor( () => expect( screen.queryByRole( 'listbox' ) ).toBeNull() );

        expect( onChange ).not.toHaveBeenCalled();
    } );

    it( 'displays a hidden interface icon without offering it', async () =>
    {
        const { trigger } = renderPicker( { value: 'chevronLeft' } );

        expect( triggerIcon( trigger ) ).toBe( 'tabler-icon-chevron-left' );

        await openGrid( trigger );

        expect( screen.queryByRole( 'option', { name: 'icons.chevronLeft' } ) ).toBeNull();
        await waitFor( () => expect( document.activeElement ).toBe( screen.getAllByRole( 'option' )[0] ) );
    } );
} );
