/**
 * Grouping is a data transformation, so it is tested as one — no component,
 * no renderer. Once rows are grouped, the group records go through the same
 * pipeline as any other collection.
 */

import { describe, it, expect } from 'vitest';
import {
    groupRows,
    rollupSortValues,
    runCollection,
    GROUP_LABEL_FIELD,
    GROUP_LABEL_KEY,
    EMPTY_COLLECTION_STATE,
} from '@/core/collection';

interface Partnership
{
    id: string;
    companyId: string;
    companyName: string;
    active: boolean;
}

const ROWS: Partnership[] = [
    { id: '1', companyId: 'c-zed',   companyName: 'Zed Supplies',   active: false },
    { id: '2', companyId: 'c-aroma', companyName: 'Aroma Botanica', active: true },
    { id: '3', companyId: 'c-zed',   companyName: 'Zed Supplies',   active: true },
    { id: '4', companyId: 'c-mid',   companyName: 'Midland Co',     active: false },
];

const label = ( rows: Partnership[], key: string ) => rows[0]?.companyName ?? key;

describe( 'groupRows', () =>
{
    it( 'partitions rows by the group key', () =>
    {
        const groups = groupRows( ROWS, 'companyId', label );
        expect( groups.map( g => g.key ) ).toEqual( ['c-zed', 'c-aroma', 'c-mid'] );
        expect( groups[0].rows.map( r => r.id ) ).toEqual( ['1', '3'] );
    } );

    it( 'preserves first-seen order so a cleared sort has something to return to', () =>
    {
        const groups = groupRows( ROWS, 'companyId', label );
        expect( groups.map( g => g.label ) ).toEqual( ['Zed Supplies', 'Aroma Botanica', 'Midland Co'] );
    } );

    it( 'falls back to the raw key when no label function is given', () =>
    {
        const groups = groupRows( ROWS, 'companyId' );
        expect( groups.map( g => g.label ) ).toEqual( ['c-zed', 'c-aroma', 'c-mid'] );
    } );

    it( 'returns nothing for an empty collection', () =>
    {
        expect( groupRows( [], 'companyId', label ) ).toEqual( [] );
    } );
} );

describe( 'group records through the shared pipeline', () =>
{
    const groups = groupRows( ROWS, 'companyId', label );

    it( 'sorts groups by label using the ordinary field path', () =>
    {
        const result = runCollection(
            groups,
            { ...EMPTY_COLLECTION_STATE, sort: { key: GROUP_LABEL_KEY, direction: 'asc' } },
            { fields: [GROUP_LABEL_FIELD] },
        );
        expect( result.map( g => g.label ) ).toEqual( ['Aroma Botanica', 'Midland Co', 'Zed Supplies'] );
    } );

    it( 'sorts groups by a rollup value', () =>
    {
        const rollups = {
            status: ( rows: Partnership[] ) => ( { value: rows.some( r => r.active ) ? 1 : 0 } ),
        };

        const result = runCollection(
            groups,
            { ...EMPTY_COLLECTION_STATE, sort: { key: 'status', direction: 'desc' } },
            { fields: [GROUP_LABEL_FIELD], sortValues: rollupSortValues( rollups ) },
        );

        // Groups with an active partnership first.
        expect( result.map( g => g.key ) ).toEqual( ['c-zed', 'c-aroma', 'c-mid'] );
        expect( result.at( -1 )?.key ).toBe( 'c-mid' );
    } );

    it( 'returns groups in natural order when no sort is active', () =>
    {
        const result = runCollection( groups, EMPTY_COLLECTION_STATE, { fields: [GROUP_LABEL_FIELD] } );
        expect( result.map( g => g.key ) ).toEqual( ['c-zed', 'c-aroma', 'c-mid'] );
    } );
} );
