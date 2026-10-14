/**
 * Test factories for the system type catalogs.
 *
 * TypeRegistry projects every catalog named in SYSTEM_TYPE_MODELS, so the store has to
 * declare a table for each of them — a projection over a table that was never declared has
 * nothing to read.
 */

import { SYSTEM_TYPE_MODELS } from '@/domains/system';
import type { SystemType } from '@/domains/system';
import type { ModelDefinition } from '@/core/models/types';

/**
 * A definition per catalog. They differ only in name: a catalog row is a label, a
 * description and the timestamps every record carries.
 */
export const makeSystemTypeDefinitions = (): Record<string, ModelDefinition> =>
    Object.fromEntries( SYSTEM_TYPE_MODELS.map( model => [model, {
        name: model,
        schema: {
            id: { type: 'uuidv4' },
            label: { type: 'text' },
            description: { type: 'text' },
            updatedAt: { type: 'datetime' }
        },
        access: { owner: 'identity', ownerField: 'ownerId' }
    }] ) );

/** A catalog record as it arrives from the wire. */
export const makeSystemType = ( overrides: Partial<SystemType> = {} ): SystemType => ( {
    id: 'partnership-type-1',
    label: 'supplier',
    description: 'Supplies raw materials',
    ...overrides
} );
