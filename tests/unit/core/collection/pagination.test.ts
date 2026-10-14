/** Paging a processed collection. Pure — no React, no renderer. */

import { describe, it, expect } from 'vitest';
import { paginate, pageCountOf, clampPage } from '@/core/collection';

const ROWS = Array.from( { length: 23 }, ( _, i ) => i + 1 );

describe( 'pageCountOf', () =>
{
    it( 'rounds up partial pages', () =>
    {
        expect( pageCountOf( 23, 10 ) ).toBe( 3 );
        expect( pageCountOf( 20, 10 ) ).toBe( 2 );
    } );

    it( 'reports one page for an empty collection, so page 1 always exists', () =>
    {
        expect( pageCountOf( 0, 10 ) ).toBe( 1 );
    } );

    it( 'reports one page when pagination is off', () =>
    {
        expect( pageCountOf( 23, undefined ) ).toBe( 1 );
    } );
} );

describe( 'clampPage', () =>
{
    it( 'holds a page inside the collection', () =>
    {
        expect( clampPage( 9, 23, 10 ) ).toBe( 3 );
        expect( clampPage( 0, 23, 10 ) ).toBe( 1 );
        expect( clampPage( -4, 23, 10 ) ).toBe( 1 );
    } );

    it( 'falls back to page 1 when filtering empties the collection', () =>
    {
        expect( clampPage( 5, 0, 10 ) ).toBe( 1 );
    } );
} );

describe( 'paginate', () =>
{
    it( 'returns the requested slice', () =>
    {
        expect( paginate( ROWS, 1, 10 ) ).toEqual( [1,2,3,4,5,6,7,8,9,10] );
        expect( paginate( ROWS, 3, 10 ) ).toEqual( [21,22,23] );
    } );

    it( 'returns every row when pagination is off', () =>
    {
        expect( paginate( ROWS, 1, undefined ) ).toHaveLength( 23 );
    } );

    it( 'clamps an out-of-range page rather than returning nothing', () =>
    {
        expect( paginate( ROWS, 99, 10 ) ).toEqual( [21,22,23] );
    } );

    it( 'leaves the caller\'s array untouched', () =>
    {
        const original = [...ROWS];
        paginate( ROWS, 2, 10 );
        expect( ROWS ).toEqual( original );
    } );
} );
