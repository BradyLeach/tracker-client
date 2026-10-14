/**
 * LocationAddress Service
 *
 * Domain store for location–address relationships. address and addressType are included
 * and composed so every observer receives the hydrated address and its classification
 * alongside the relationship.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { joinOne } from '@/services/domain/joins';
import type { SystemType } from '@/domains/system/types/systemType.types';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Address } from '../../address/types/address.types';
import type { LocationAddress } from '../types/locationAddress.types';

const MODEL = 'locationAddress';
const PATH = 'business/locations/addresses';

const base = createDomainStore<LocationAddress>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: ['address', 'addressType'],
    recordIncludes: ['address', 'addressType'],
    compose: rows => joinOne<LocationAddress, SystemType, 'addressType'>(
        MODEL,
        joinOne<LocationAddress, Address, 'address'>( MODEL, rows, 'address', 'address' ),
        'addressType',
        'addressType'
    ),
} );

export const locationAddressService = {
    ...base,

    /**
     * The address relationships of one location, each with its address and addressType
     * attached.
     *
     * The scope filter is passed too, so a location read that included its addresses has
     * already satisfied this edge and the traversal is a local indexed read.
     */
    observeByLocation( locationId: string ): DataQuerySource<LocationAddress[]>
    {
        return base.observeWhere( { locationId }, { locationId } );
    },

    /**
     * The address relationships of a set of locations, each with its address and
     * addressType attached. The caller groups by locationId.
     */
    observeByLocations( locationIds: string[] ): DataQuerySource<LocationAddress[]>
    {
        return base.observeWhere( { locationId: { anyOf: locationIds } }, { locationId: { anyOf: locationIds } } );
    },
};
