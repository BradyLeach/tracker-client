/**
 * Test factories for the entity store
 *
 * A minimal slice of the model graph — a company with many partnerships — which is
 * enough to exercise flat storage, foreign key indexes and edge traversal.
 */

import type { ModelDefinition } from '@/core/models/types';

/**
 * Definitions in the shape the `/definition` endpoint returns them.
 *
 * The edge is declared from both sides on purpose: `company hasMany partnership` is what
 * puts the `companyId` index on the partnership table, and the reverse `belongsTo` is what
 * the shredder matches a nested `company` key against.
 */
export const makeStoreDefinitions = (): Record<string, ModelDefinition> => ( {
    company: {
        name: 'company',
        schema: {
            id: { type: 'uuidv4' },
            name: { type: 'text' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {
            partnership: { type: 'hasMany', target: 'partnership', foreignKey: 'companyId' },
            location: { type: 'hasMany', target: 'location', foreignKey: 'companyId' }
        }
    },
    partnership: {
        name: 'partnership',
        schema: {
            id: { type: 'uuidv4' },
            companyId: { type: 'uuidv4' },
            label: { type: 'text' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {
            company: { type: 'belongsTo', target: 'company', foreignKey: 'companyId' }
        }
    },
    /** Unrelated to the company/partnership edge — stands in for a SET_NULL survivor's model. */
    order: {
        name: 'order',
        schema: {
            id: { type: 'uuidv4' },
            companyId: { type: 'uuidv4' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {}
    },
    location: {
        name: 'location',
        schema: {
            id: { type: 'uuidv4' },
            companyId: { type: 'uuidv4' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {
            company: { type: 'belongsTo', target: 'company', foreignKey: 'companyId' },
            locationAddress: { type: 'hasMany', target: 'locationAddress', foreignKey: 'locationId' }
        }
    },
    locationAddress: {
        name: 'locationAddress',
        schema: {
            id: { type: 'uuidv4' },
            locationId: { type: 'uuidv4' },
            addressId: { type: 'uuidv4' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {
            location: { type: 'belongsTo', target: 'location', foreignKey: 'locationId' },
            address: { type: 'belongsTo', target: 'address', foreignKey: 'addressId' }
        }
    },
    address: {
        name: 'address',
        schema: {
            id: { type: 'uuidv4' },
            countryId: { type: 'uuidv4' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {
            country: { type: 'belongsTo', target: 'country', foreignKey: 'countryId' }
        }
    },
    country: {
        name: 'country',
        schema: {
            id: { type: 'uuidv4' },
            name: { type: 'text' }
        },
        access: { owner: 'account', ownerField: 'ownerId' },
        associations: {}
    }
} );

/** A company record as it arrives from the wire. */
export const makeCompany = ( overrides: Record<string, unknown> = {} ) => ( {
    id: 'company-1',
    name: 'Acme Soap',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides
} );

/** A partnership record as it arrives from the wire. */
export const makePartnership = ( overrides: Record<string, unknown> = {} ) => ( {
    id: 'partnership-1',
    companyId: 'company-1',
    label: 'supplier',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides
} );
