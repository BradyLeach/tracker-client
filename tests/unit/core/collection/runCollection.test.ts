/**
 * The collection pipeline's behaviour, exercised without React or any
 * renderer — which is the point of keeping it pure.
 */

import { describe, it, expect } from 'vitest';
import { runCollection } from '@/core/collection';
import type { CollectionField, CollectionState } from '@/core/collection';
import { EMPTY_COLLECTION_STATE } from '@/core/collection';

interface Company
{
    id: string;
    name: string;
    websiteUrl: string;
    rating: number;
    signedAt: string;
    status: { label: string };
}

const FIELDS: CollectionField[] = [
    { key: 'name', type: 'text' },
    { key: 'websiteUrl', type: 'url' },
    { key: 'rating', type: 'rating' },
    { key: 'signedAt', type: 'date' },
    { key: 'status.label', type: 'state' },
];

const COMPANIES: Company[] = [
    { id: '1', name: 'Tallowmere Fats',  websiteUrl: 'https://tallowmere.test',  rating: 2, signedAt: '2024-03-01', status: { label: 'Inactive' } },
    { id: '2', name: 'Aroma Botanica',   websiteUrl: 'https://aroma.test',       rating: 5, signedAt: '2024-01-15', status: { label: 'Active' } },
    { id: '3', name: 'kembla Caustics',  websiteUrl: 'https://kembla.test',      rating: 4, signedAt: '2024-07-09', status: { label: 'Active' } },
    { id: '4', name: '3M Supplies',      websiteUrl: 'https://threem.test',      rating: 1, signedAt: '2023-11-30', status: { label: 'Inactive' } },
];

const state = ( overrides: Partial<CollectionState> = {} ): CollectionState =>
    ( { ...EMPTY_COLLECTION_STATE, ...overrides } );

const names = ( rows: Company[] ) => rows.map( row => row.name );

describe( 'runCollection', () =>
{
    it( 'returns every row in its original order when nothing is asked for', () =>
    {
        const result = runCollection( COMPANIES, state(), { fields: FIELDS } );
        expect( names( result ) ).toEqual( names( COMPANIES ) );
    } );

    it( 'leaves the caller\'s array untouched', () =>
    {
        const original = [...COMPANIES];
        runCollection( COMPANIES, state( { sort: { key: 'name', direction: 'desc' } } ), { fields: FIELDS } );
        expect( COMPANIES ).toEqual( original );
    } );

    describe( 'sorting', () =>
    {
        it( 'orders text case-insensitively rather than by character code', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'name', direction: 'asc' } } ),
                { fields: FIELDS },
            );
            // 'kembla' must land between 'Aroma' and 'Tallowmere', not after them.
            expect( names( result ) ).toEqual( ['3M Supplies', 'Aroma Botanica', 'kembla Caustics', 'Tallowmere Fats'] );
        } );

        it( 'orders numbers numerically, not lexically', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'rating', direction: 'desc' } } ),
                { fields: FIELDS },
            );
            expect( result.map( row => row.rating ) ).toEqual( [5, 4, 2, 1] );
        } );

        it( 'orders dates chronologically', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'signedAt', direction: 'asc' } } ),
                { fields: FIELDS },
            );
            expect( result.map( row => row.signedAt ) ).toEqual(
                ['2023-11-30', '2024-01-15', '2024-03-01', '2024-07-09'],
            );
        } );

        it( 'resolves dot-notation keys', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'status.label', direction: 'asc' } } ),
                { fields: FIELDS },
            );
            expect( result.map( row => row.status.label ) ).toEqual(
                ['Active', 'Active', 'Inactive', 'Inactive'],
            );
        } );

        it( 'sorts missing values last in both directions', () =>
        {
            const withGap = [
                { ...COMPANIES[0], rating: undefined as unknown as number },
                COMPANIES[1],
                COMPANIES[3],
            ];

            const asc = runCollection( withGap, state( { sort: { key: 'rating', direction: 'asc' } } ), { fields: FIELDS } );
            const desc = runCollection( withGap, state( { sort: { key: 'rating', direction: 'desc' } } ), { fields: FIELDS } );

            expect( asc.at( -1 )?.rating ).toBeUndefined();
            expect( desc.at( -1 )?.rating ).toBeUndefined();
        } );

        it( 'leaves rows in natural order when the sort key matches no field', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'nonexistent', direction: 'asc' } } ),
                { fields: FIELDS },
            );
            expect( names( result ) ).toEqual( names( COMPANIES ) );
        } );

        it( 'prefers a sort value selector over the field type', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'name', direction: 'asc' } } ),
                { fields: FIELDS, sortValues: { name: row => row.rating } },
            );
            expect( result.map( row => row.rating ) ).toEqual( [1, 2, 4, 5] );
        } );

        it( 'sorts by a selector for a key that is not a field at all', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'nameLength', direction: 'asc' } } ),
                { fields: FIELDS, sortValues: { nameLength: row => row.name.length } },
            );
            expect( result.map( row => row.name.length ) ).toEqual( [11, 14, 15, 15] );
        } );

        it( 'keeps selector-derived missing values last in both directions', () =>
        {
            const withGap: Company[] = [
                { ...COMPANIES[0], rating: undefined as unknown as number },
                COMPANIES[1],
                COMPANIES[3],
            ];

            const sortValues = { computed: ( row: Company ) => row.rating };

            const asc = runCollection( withGap, state( { sort: { key: 'computed', direction: 'asc' } } ), { sortValues } );
            const desc = runCollection( withGap, state( { sort: { key: 'computed', direction: 'desc' } } ), { sortValues } );

            expect( asc.at( -1 )?.rating ).toBeUndefined();
            expect( desc.at( -1 )?.rating ).toBeUndefined();
        } );

        it( 'orders numeric selector values numerically despite no declared type', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { sort: { key: 'computed', direction: 'asc' } } ),
                { sortValues: { computed: row => row.rating } },
            );
            expect( result.map( row => row.rating ) ).toEqual( [1, 2, 4, 5] );
        } );
    } );

    describe( 'search', () =>
    {
        it( 'matches case-insensitively across textual fields', () =>
        {
            const result = runCollection( COMPANIES, state( { search: 'AROMA' } ), { fields: FIELDS } );
            expect( names( result ) ).toEqual( ['Aroma Botanica'] );
        } );

        it( 'ignores a whitespace-only term instead of excluding everything', () =>
        {
            const result = runCollection( COMPANIES, state( { search: '   ' } ), { fields: FIELDS } );
            expect( result ).toHaveLength( COMPANIES.length );
        } );

        it( 'does not read non-textual fields by default', () =>
        {
            // '5' is company 2's rating; searching it must not surface the row.
            const result = runCollection( COMPANIES, state( { search: '5' } ), { fields: FIELDS } );
            expect( result ).toHaveLength( 0 );
        } );

        it( 'reads only the keys given when searchKeys is explicit', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { search: 'kembla' } ),
                { fields: FIELDS, searchKeys: ['name'] },
            );
            expect( names( result ) ).toEqual( ['kembla Caustics'] );
        } );
    } );

    describe( 'A–Z index', () =>
    {
        it( 'matches on first letter regardless of case', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { alphaIndex: 'K' } ),
                { fields: FIELDS, alphaKey: 'name' },
            );
            expect( names( result ) ).toEqual( ['kembla Caustics'] );
        } );

        it( 'buckets non-alphabetic leads under #', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { alphaIndex: '#' } ),
                { fields: FIELDS, alphaKey: 'name' },
            );
            expect( names( result ) ).toEqual( ['3M Supplies'] );
        } );

        it( 'does nothing without an alphaKey rather than emptying the list', () =>
        {
            const result = runCollection( COMPANIES, state( { alphaIndex: 'K' } ), { fields: FIELDS } );
            expect( result ).toHaveLength( COMPANIES.length );
        } );
    } );

    describe( 'named filters', () =>
    {
        const filters = [
            { key: 'active', predicate: ( row: Company ) => row.status.label === 'Active' },
            { key: 'topRated', predicate: ( row: Company ) => row.rating >= 4 },
        ];

        it( 'applies an active filter', () =>
        {
            const result = runCollection( COMPANIES, state( { activeFilterKeys: ['active'] } ), { fields: FIELDS, filters } );
            expect( names( result ) ).toEqual( ['Aroma Botanica', 'kembla Caustics'] );
        } );

        it( 'intersects multiple active filters', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { activeFilterKeys: ['active', 'topRated'] } ),
                { fields: FIELDS, filters },
            );
            expect( names( result ) ).toEqual( ['Aroma Botanica', 'kembla Caustics'] );
        } );

        describe( 'facets', () =>
        {
            const faceted = [
                { key: 'active', predicate: ( row: Company ) => row.status.label === 'Active' },
                { key: 'topRated', predicate: ( row: Company ) => row.rating >= 4, group: 'rating' },
                { key: 'lowRated', predicate: ( row: Company ) => row.rating <= 2, group: 'rating' },
            ];

            it( 'ORs selections within a group rather than intersecting them', () =>
            {
                const result = runCollection(
                    COMPANIES,
                    state( { activeFilterKeys: ['topRated', 'lowRated'] } ),
                    { fields: FIELDS, filters: faceted },
                );

                // Both together must widen; the intersection would be empty.
                expect( names( result ) ).toEqual(
                    ['Tallowmere Fats', 'Aroma Botanica', 'kembla Caustics', '3M Supplies'],
                );
            } );

            it( 'ANDs a group against an ungrouped filter', () =>
            {
                const result = runCollection(
                    COMPANIES,
                    state( { activeFilterKeys: ['active', 'topRated', 'lowRated'] } ),
                    { fields: FIELDS, filters: faceted },
                );

                expect( names( result ) ).toEqual( ['Aroma Botanica', 'kembla Caustics'] );
            } );

            it( 'treats a single selection in a group as a plain filter', () =>
            {
                const result = runCollection(
                    COMPANIES,
                    state( { activeFilterKeys: ['lowRated'] } ),
                    { fields: FIELDS, filters: faceted },
                );

                expect( names( result ) ).toEqual( ['Tallowmere Fats', '3M Supplies'] );
            } );

            it( 'ANDs separate groups with each other', () =>
            {
                const grouped = [
                    ...faceted,
                    { key: 'hasSite', predicate: ( row: Company ) => !!row.websiteUrl, group: 'presence' },
                ];

                const result = runCollection(
                    COMPANIES,
                    state( { activeFilterKeys: ['lowRated', 'hasSite'] } ),
                    { fields: FIELDS, filters: grouped },
                );

                expect( names( result ) ).toEqual( ['Tallowmere Fats', '3M Supplies'] );
            } );
        } );

        it( 'ignores an unknown filter key so state outliving a config change stays usable', () =>
        {
            const result = runCollection( COMPANIES, state( { activeFilterKeys: ['nope'] } ), { fields: FIELDS, filters } );
            expect( result ).toHaveLength( COMPANIES.length );
        } );

        it( 'still applies the filters it recognises alongside an unknown one', () =>
        {
            const result = runCollection(
                COMPANIES,
                state( { activeFilterKeys: ['removed-last-release', 'active'] } ),
                { fields: FIELDS, filters },
            );
            expect( names( result ) ).toEqual( ['Aroma Botanica', 'kembla Caustics'] );
        } );
    } );

    it( 'combines filter, search and sort in one pass', () =>
    {
        const result = runCollection(
            COMPANIES,
            state( {
                activeFilterKeys: ['active'],
                search: 'test',
                sort: { key: 'rating', direction: 'asc' },
            } ),
            {
                fields: FIELDS,
                filters: [{ key: 'active', predicate: ( row: Company ) => row.status.label === 'Active' }],
            },
        );

        expect( names( result ) ).toEqual( ['kembla Caustics', 'Aroma Botanica'] );
    } );
} );
