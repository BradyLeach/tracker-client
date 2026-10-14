/**
 * IconRenderer Unit Tests
 *
 * The single place an icon name becomes an icon. Asserted on the icon that renders, read
 * from the class the icon library stamps on its svg.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconRenderer } from '@/components/ui/icons/Icon';

/** The icon library names each svg `tabler-icon-<name>`. */
function renderedIcon( container: HTMLElement ): string | undefined
{
    const svg = container.querySelector( 'svg.tabler-icon' );
    return [...( svg?.classList ?? [] )].find( name => name !== 'tabler-icon' );
}

describe( 'IconRenderer', () =>
{
    it( 'renders a known key', () =>
    {
        const { container } = render( <IconRenderer iconKey="trash" /> );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-trash' );
    } );

    it( 'renders a known name from data', () =>
    {
        const { container } = render( <IconRenderer iconName="flask" /> );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-flask' );
    } );

    it( 'prefers a known data name over the key it defaults from', () =>
    {
        const { container } = render( <IconRenderer iconName="flask" iconKey="building" /> );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-flask' );
    } );

    it( 'falls back to the key when the data name is unknown', () =>
    {
        const { container } = render( <IconRenderer iconName="nonesuch" iconKey="building" /> );

        expect( renderedIcon( container ) ).toBe( 'tabler-icon-building' );
    } );

    it( 'renders the fallback when no name resolves', () =>
    {
        const { container } = render( <IconRenderer iconName="nonesuch" fallback="AS" /> );

        expect( renderedIcon( container ) ).toBeUndefined();
        expect( screen.getByText( 'AS' ) ).toBeInTheDocument();
    } );

    it( 'renders the default icon when no name resolves and there is no fallback', () =>
    {
        const unknown = render( <IconRenderer iconName="nonesuch" /> );
        const missing = render( <IconRenderer /> );

        expect( renderedIcon( unknown.container ) ).toBe( 'tabler-icon-settings' );
        expect( renderedIcon( missing.container ) ).toBe( 'tabler-icon-settings' );
    } );

    it( 'does not resolve a name inherited from Object', () =>
    {
        const { container } = render( <IconRenderer iconName="toString" fallback="AS" /> );

        expect( renderedIcon( container ) ).toBeUndefined();
    } );
} );
