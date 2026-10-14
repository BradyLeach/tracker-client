/**
 * Include Scope Tests
 *
 * Verifies that confirmIncludeScopes walks the requested include paths through the
 * raw response tree, confirming scope at each level using association metadata.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { dataStore } from '@/services/dataStore/dataStore';
import { isSatisfied } from '@/services/domain/scope';
import { buildIncludeTree, confirmIncludeScopes } from '@/services/domain/includeScope';
import { makeStoreDefinitions } from '@/test-factories/dataStore';

vi.mock( '@/core/models/model.service', () => ( {
    modelService: { getModelDefinitions: vi.fn(), getPublicModelDefinitions: vi.fn() }
} ) );

// <=======================================================================>
// <=========================> buildIncludeTree <===========================>
// <=======================================================================>

describe( 'buildIncludeTree', () =>
{
    it( 'builds a nested tree from dot-path strings', () =>
    {
        const tree = buildIncludeTree( [
            'location',
            'location.locationAddress',
            'location.locationAddress.address',
            'location.locationAddress.address.country'
        ] );

        expect( tree ).toEqual( {
            location: {
                locationAddress: {
                    address: {
                        country: {}
                    }
                }
            }
        } );
    } );

    it( 'merges sibling paths', () =>
    {
        const tree = buildIncludeTree( ['partnership', 'location', 'location.locationAddress'] );

        expect( tree ).toEqual( {
            partnership: {},
            location: { locationAddress: {} }
        } );
    } );

    it( 'returns an empty tree for an empty array', () =>
    {
        expect( buildIncludeTree( [] ) ).toEqual( {} );
    } );
} );

// <=======================================================================>
// <=====================> confirmIncludeScopes <===========================>
// <=======================================================================>

describe( 'confirmIncludeScopes', () =>
{
    beforeEach( async () =>
    {
        vi.mocked( modelService.getModelDefinitions ).mockResolvedValue( {
            status: 200,
            data: makeStoreDefinitions()
        } );

        await modelRegistry.load();
        await dataStore.open( 'include-scope-test' );
    } );

    afterEach( async () =>
    {
        await dataStore.destroy();
        vi.clearAllMocks();
    } );

    it( 'confirms a flat hasMany edge, identical to the old behaviour', async () =>
    {
        const records = [
            { id: 'c1', name: 'Acme', partnership: [{ id: 'p1', companyId: 'c1' }] }
        ];

        await confirmIncludeScopes( records, 'company', ['partnership'] );

        expect( await isSatisfied( 'partnership', { companyId: 'c1' } ) ).toBe( true );
        expect( await isSatisfied( 'partnership', { companyId: 'c2' } ) ).toBe( false );
    } );

    it( 'confirms a 3-level hasMany → hasMany → belongsTo chain', async () =>
    {
        const records = [
            {
                id: 'c1',
                location: [
                    {
                        id: 'loc1',
                        companyId: 'c1',
                        locationAddress: [
                            {
                                id: 'la1',
                                locationId: 'loc1',
                                addressId: 'addr1',
                                address: { id: 'addr1', countryId: 'au' }
                            }
                        ]
                    }
                ]
            }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress',
            'location.locationAddress.address'
        ] );

        expect( await isSatisfied( 'location', { companyId: 'c1' } ) ).toBe( true );
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc1' } ) ).toBe( true );
        expect( await isSatisfied( 'address', { id: 'addr1' } ) ).toBe( true );
    } );

    it( 'confirms belongsTo at every level of a deep chain', async () =>
    {
        const records = [
            {
                id: 'c1',
                location: [
                    {
                        id: 'loc1',
                        companyId: 'c1',
                        locationAddress: [
                            {
                                id: 'la1',
                                locationId: 'loc1',
                                addressId: 'addr1',
                                address: {
                                    id: 'addr1',
                                    countryId: 'au',
                                    country: { id: 'au', name: 'Australia' }
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress',
            'location.locationAddress.address',
            'location.locationAddress.address.country'
        ] );

        expect( await isSatisfied( 'country', { id: 'au' } ) ).toBe( true );
        expect( await isSatisfied( 'country', { id: 'nz' } ) ).toBe( false );
    } );

    it( 'confirms the edge but does not recurse when hasMany returns empty', async () =>
    {
        const records = [
            { id: 'c1', location: [] }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress'
        ] );

        // The edge is confirmed — the server said "no locations for this company".
        expect( await isSatisfied( 'location', { companyId: 'c1' } ) ).toBe( true );
        // No child data to derive locationAddress scopes from.
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc1' } ) ).toBe( false );
    } );

    it( 'does not confirm scopes for unrequested nested data', async () =>
    {
        const records = [
            {
                id: 'c1',
                location: [
                    {
                        id: 'loc1',
                        companyId: 'c1',
                        locationAddress: [
                            { id: 'la1', locationId: 'loc1', addressId: 'addr1' }
                        ]
                    }
                ]
            }
        ];

        // Only request 'location', not 'location.locationAddress'
        await confirmIncludeScopes( records, 'company', ['location'] );

        expect( await isSatisfied( 'location', { companyId: 'c1' } ) ).toBe( true );
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc1' } ) ).toBe( false );
    } );

    it( 'handles missing nested keys without error', async () =>
    {
        const records = [
            { id: 'c1', name: 'Acme' }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress'
        ] );

        // The alias key is absent — the server did not return the include, so
        // no scope is confirmed.
        expect( await isSatisfied( 'location', { companyId: 'c1' } ) ).toBe( false );
    } );

    it( 'deduplicates belongsTo ids across multiple parent records', async () =>
    {
        const records = [
            {
                id: 'c1',
                location: [
                    {
                        id: 'loc1', companyId: 'c1',
                        locationAddress: [
                            { id: 'la1', locationId: 'loc1', addressId: 'addr1', address: { id: 'addr1', countryId: 'au' } },
                            { id: 'la2', locationId: 'loc1', addressId: 'addr1', address: { id: 'addr1', countryId: 'au' } }
                        ]
                    }
                ]
            }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress',
            'location.locationAddress.address'
        ] );

        // Should work without error — addr1 confirmed once despite appearing twice.
        expect( await isSatisfied( 'address', { id: 'addr1' } ) ).toBe( true );
    } );

    it( 'handles no records gracefully', async () =>
    {
        await confirmIncludeScopes( [], 'company', ['location'] );
        await confirmIncludeScopes( undefined, 'company', ['location'] );
        // No assertions needed — just verifying no errors.
    } );

    it( 'handles no includes gracefully', async () =>
    {
        await confirmIncludeScopes( [{ id: 'c1' }], 'company', [] );
        await confirmIncludeScopes( [{ id: 'c1' }], 'company', undefined );
    } );

    it( 'does not confirm belongsTo when addressId exists but address object is absent', async () =>
    {
        const records = [
            {
                id: 'c1',
                location: [
                    {
                        id: 'loc1',
                        companyId: 'c1',
                        locationAddress: [
                            { id: 'la1', locationId: 'loc1', addressId: 'addr1' }
                        ]
                    }
                ]
            }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress',
            'location.locationAddress.address'
        ] );

        expect( await isSatisfied( 'location', { companyId: 'c1' } ) ).toBe( true );
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc1' } ) ).toBe( true );
        expect( await isSatisfied( 'address', { id: 'addr1' } ) ).toBe( false );
    } );

    it( 'confirms the full Company → Location → LocationAddress → Address → Country chain', async () =>
    {
        const records = [
            {
                id: 'company-1',
                name: 'Saasy Soap Co',
                location: [
                    {
                        id: 'loc-1',
                        companyId: 'company-1',
                        locationAddress: [
                            {
                                id: 'la-1',
                                locationId: 'loc-1',
                                addressId: 'addr-1',
                                address: {
                                    id: 'addr-1',
                                    countryId: 'au',
                                    country: { id: 'au', name: 'Australia' }
                                }
                            },
                            {
                                id: 'la-2',
                                locationId: 'loc-1',
                                addressId: 'addr-2',
                                address: {
                                    id: 'addr-2',
                                    countryId: 'nz',
                                    country: { id: 'nz', name: 'New Zealand' }
                                }
                            }
                        ]
                    },
                    {
                        id: 'loc-2',
                        companyId: 'company-1',
                        locationAddress: []
                    }
                ]
            }
        ];

        await confirmIncludeScopes( records, 'company', [
            'location',
            'location.locationAddress',
            'location.locationAddress.address',
            'location.locationAddress.address.country'
        ] );

        // hasMany: company → locations
        expect( await isSatisfied( 'location', { companyId: 'company-1' } ) ).toBe( true );

        // hasMany: location → locationAddresses (both locations)
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc-1' } ) ).toBe( true );
        expect( await isSatisfied( 'locationAddress', { locationId: 'loc-2' } ) ).toBe( true );

        // belongsTo: locationAddress → address (two distinct addresses)
        expect( await isSatisfied( 'address', { id: 'addr-1' } ) ).toBe( true );
        expect( await isSatisfied( 'address', { id: 'addr-2' } ) ).toBe( true );

        // belongsTo: address → country (two distinct countries)
        expect( await isSatisfied( 'country', { id: 'au' } ) ).toBe( true );
        expect( await isSatisfied( 'country', { id: 'nz' } ) ).toBe( true );

        // Unrelated scopes remain unsatisfied
        expect( await isSatisfied( 'location', { companyId: 'company-2' } ) ).toBe( false );
        expect( await isSatisfied( 'address', { id: 'addr-99' } ) ).toBe( false );
        expect( await isSatisfied( 'country', { id: 'us' } ) ).toBe( false );
    } );
} );
