/**
 * Icons Config Unit Tests
 *
 * Every registered icon is offered in a picker, so each must carry a category to filter
 * by and a label with a translation. A missing one fails here rather than rendering as a
 * raw key or an ungrouped icon.
 */

import { describe, it, expect } from 'vitest';
import { ICONS, ICON_KEYS } from '@/config/icons.config';
import en from '@/utils/languages/en-GB';

describe( 'icons config', () =>
{
    it( 'gives every icon a category', () =>
    {
        const uncategorised = ICON_KEYS.filter( key => !( ICONS[key] as { category?: string } ).category );

        expect( uncategorised ).toEqual( [] );
    } );

    it( 'gives every category in use an en-GB heading', () =>
    {
        const headings = en.shared.iconCategory as Record<string, string>;
        const categories = new Set( ICON_KEYS.map( key => ( ICONS[key] as { category?: string } ).category ) );
        const untranslated = [...categories].filter( category => !category || !headings[category]?.trim() );

        expect( untranslated ).toEqual( [] );
    } );

    it( 'gives every icon a label with an en-GB translation', () =>
    {
        const untranslated = ICON_KEYS.filter( key =>
        {
            const label = ( ICONS[key] as { label?: string } ).label;
            const [namespace, name] = label?.split( '.' ) ?? [];
            const translations = ( en as unknown as Record<string, Record<string, unknown>> )[namespace ?? ''];
            const translation = translations?.[name ?? ''];

            return typeof translation !== 'string' || !translation.trim();
        } );

        expect( untranslated ).toEqual( [] );
    } );

    it( 'translates no icon the registry does not hold', () =>
    {
        const orphaned = Object.keys( en.icons ).filter( key => !ICON_KEYS.includes( key as never ) );

        expect( orphaned ).toEqual( [] );
    } );
} );
