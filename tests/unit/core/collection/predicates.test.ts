/**
 * Predicate helpers used by the collection pipeline and by the controls that
 * report intent to it — notably the A–Z index, which needs to know which
 * letters are worth offering.
 */

import { describe, it, expect } from 'vitest';
import {
    availableAlphaIndexes,
    matchesSearch,
    resolveSearchFields,
    runCollection,
    EMPTY_COLLECTION_STATE,
    NON_ALPHA_INDEX,
} from '@/core/collection';
import type { CollectionField } from '@/core/collection';

const FIELDS: CollectionField[] = [
    { key: 'name', type: 'text' },
    { key: 'email', type: 'email' },
    { key: 'websiteUrl', type: 'url' },
    { key: 'rating', type: 'rating' },
    { key: 'signedAt', type: 'date' },
    { key: 'untyped' },
];

describe( 'resolveSearchFields', () =>
{
    const keysOf = ( fields: readonly { key: string }[] ) => fields.map( field => field.key );

    it( 'defaults to the textual fields only', () =>
    {
        expect( keysOf( resolveSearchFields( FIELDS ) ) ).toEqual( ['name', 'email', 'websiteUrl', 'untyped'] );
    } );

    it( 'treats an untyped field as text', () =>
    {
        expect( keysOf( resolveSearchFields( [{ key: 'label' }] ) ) ).toEqual( ['label'] );
    } );

    it( 'returns the explicit keys unchanged when given them', () =>
    {
        expect( keysOf( resolveSearchFields( FIELDS, ['rating'] ) ) ).toEqual( ['rating'] );
    } );

    it( 'honours an explicit empty list rather than falling back to defaults', () =>
    {
        expect( resolveSearchFields( FIELDS, [] ) ).toEqual( [] );
    } );

    it( 'includes a non-textual field that supplies its own search text', () =>
    {
        const fields: CollectionField[] = [
            { key: 'rating', type: 'rating' },
            { key: 'productionTypeId', type: 'text', searchValue: () => 'Cold Process' },
        ];

        expect( keysOf( resolveSearchFields( fields ) ) ).toEqual( ['productionTypeId'] );
    } );

    it( 'keeps a field\'s own search text when explicit keys name it', () =>
    {
        const fields: CollectionField[] = [
            { key: 'productionTypeId', type: 'text', searchValue: () => 'Cold Process' },
        ];

        const [field] = resolveSearchFields( fields, ['productionTypeId'] );
        expect( field.searchValue?.( {} ) ).toBe( 'Cold Process' );
    } );

    it( 'falls back to the raw value for an explicit key the config does not describe', () =>
    {
        const [field] = resolveSearchFields( [], ['notes'] );
        expect( field ).toEqual( { key: 'notes' } );
    } );
} );

describe( 'matchesSearch', () =>
{
    const row = { name: 'Lavender Bar', productionTypeId: 'a4f1-uuid' };

    it( 'matches on a raw value when the field supplies no text', () =>
    {
        expect( matchesSearch( row, 'lavender', [{ key: 'name' }] ) ).toBe( true );
    } );

    it( 'matches an empty term against everything', () =>
    {
        expect( matchesSearch( row, '   ', [{ key: 'name' }] ) ).toBe( true );
    } );

    it( 'reads the supplied text rather than the stored id', () =>
    {
        const fields = [{ key: 'productionTypeId', searchValue: () => 'Cold Process' }];

        expect( matchesSearch( row, 'cold', fields ) ).toBe( true );
        expect( matchesSearch( row, 'a4f1', fields ) ).toBe( false );
    } );

    /**
     * The callbacks are added to the config by an orchestrator, so a page passing
     * the config it built rather than the one it was given searches raw values and
     * silently matches nothing. The end-to-end path is what proves the wiring.
     */
    it( 'searches a derived column through the pipeline, not the stored row', () =>
    {
        type Row = { id: string };
        const rows: Row[] = [{ id: 'a' }, { id: 'b' }];

        const fields: CollectionField<Row>[] = [
            { key: 'partnershipTypes', type: 'text', searchValue: row => row.id === 'a' ? 'Supplier' : 'Stockist' },
        ];

        const found = runCollection( rows, { ...EMPTY_COLLECTION_STATE, search: 'supplier' }, { fields } );
        expect( found ).toEqual( [{ id: 'a' }] );
    } );
} );

describe( 'availableAlphaIndexes', () =>
{
    const rows = [
        { name: 'Aroma Botanica' },
        { name: 'aardvark Ltd' },
        { name: '3M Supplies' },
        { name: 'Kembla' },
        { name: '' },
    ];

    it( 'reports each distinct initial once, uppercased', () =>
    {
        const result = availableAlphaIndexes( rows, 'name' );
        expect( [...result].sort() ).toEqual( ['#', 'A', 'K'] );
    } );

    it( 'buckets numeric, symbolic and empty leads under #', () =>
    {
        const result = availableAlphaIndexes( [{ name: '3M' }, { name: '' }, { name: '—' }], 'name' );
        expect( [...result] ).toEqual( [NON_ALPHA_INDEX] );
    } );

    it( 'returns nothing without a key, so the control can hide itself', () =>
    {
        expect( availableAlphaIndexes( rows, undefined ).size ).toBe( 0 );
    } );
} );
