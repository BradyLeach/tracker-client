/**
 * Address and LocationAddress mock data
 *
 * Shared across playgrounds that need address rows or location–address relationships.
 * Lives in devTools — not domain code, not used in production.
 */

import type { Address } from '@/domains/business/address/types/address.types';
import type { LocationAddress } from '@/domains/business/locationAddress/types/locationAddress.types';
import type { SystemType } from '@/domains/system/types/systemType.types';
import type { AutocompleteOption } from '@/components/ui';

const OWNER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

export const LOCATION_ADDRESS_LOCATION_ID = 'cccccccc-0000-0000-0000-000000000001';

export const COUNTRY_OPTION_MOCKS: AutocompleteOption[] = [
    { value: 'eeeeeeee-0000-0000-0000-000000000001', label: 'Australia' },
    { value: 'eeeeeeee-0000-0000-0000-000000000002', label: 'New Zealand' },
    { value: 'eeeeeeee-0000-0000-0000-000000000003', label: 'United Kingdom' },
];

export const ADDRESS_TYPE_MOCKS: SystemType[] = [
    { id: 'ffffffff-0000-0000-0000-000000000001', label: 'shipping' },
    { id: 'ffffffff-0000-0000-0000-000000000002', label: 'physical' },
    { id: 'ffffffff-0000-0000-0000-000000000003', label: 'pickup' },
];

export const ADDRESS_MOCKS: Address[] = [
    {
        id: '22222222-0000-0000-0000-000000000001',
        ownerId: OWNER_ID,
        countryId: 'eeeeeeee-0000-0000-0000-000000000001',
        line1: '12 Kewdale Rd',
        city: 'Perth',
        postalCode: '6105',
    },
    {
        id: '22222222-0000-0000-0000-000000000002',
        ownerId: OWNER_ID,
        countryId: 'eeeeeeee-0000-0000-0000-000000000001',
        line1: '400 Hay St',
        line2: 'Level 3',
        city: 'Perth',
        postalCode: '6000',
    },
];

/** One location holding two relationships, distinguished by address type. */
export const LOCATION_ADDRESS_MOCKS: LocationAddress[] = [
    {
        id: '33333333-0000-0000-0000-000000000001',
        ownerId: OWNER_ID,
        locationId: LOCATION_ADDRESS_LOCATION_ID,
        addressId: ADDRESS_MOCKS[0].id,
        addressTypeId: ADDRESS_TYPE_MOCKS[0].id,
        address: ADDRESS_MOCKS[0],
        addressType: ADDRESS_TYPE_MOCKS[0],
    },
    {
        id: '33333333-0000-0000-0000-000000000002',
        ownerId: OWNER_ID,
        locationId: LOCATION_ADDRESS_LOCATION_ID,
        addressId: ADDRESS_MOCKS[1].id,
        addressTypeId: ADDRESS_TYPE_MOCKS[1].id,
        address: ADDRESS_MOCKS[1],
        addressType: ADDRESS_TYPE_MOCKS[1],
    },
];
