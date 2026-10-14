/**
 * Company Profile Service
 *
 * The areas of a company profile that are not part of the Company record:
 * locations.
 *
 * MOCKED. Each method resolves canned data with the real dataService call
 * commented beside it. Uncomment and delete the mock when the endpoint lands —
 * no hook, section or page changes, because every consumer already reads
 * ApiResponse through a hook.
 *
 * Returns ApiResponse — error handling is the caller's responsibility.
 */

import type { ApiResponse } from '@/services/dataService/dataService.types';
import type {
    CompanyLocationPoint,
} from '../types/companyProfile.types';

// TODO: Replace path constants with real endpoints when the backend is ready
// const COMPANY_LOCATIONS_PATH = 'business/companies/:id/locations';

const MOCK_LOCATIONS: CompanyLocationPoint[] = [
    { id: 'addr-1', source: 'address', label: 'Head Office', addressLine: '1 Market St, Sydney NSW 2000', lat: -33.8688, lng: 151.2093 },
    { id: 'addr-2', source: 'address', label: 'Billing', addressLine: '400 Docklands Dr, Melbourne VIC 3008', lat: -37.8136, lng: 144.9631 },
    { id: 'loc-1', source: 'location', label: 'Perth Warehouse', addressLine: '12 Kewdale Rd, Perth WA 6105', lat: -31.9523, lng: 115.8613 },
    { id: 'loc-2', source: 'location', label: 'Brisbane Depot', addressLine: '55 Ann St, Brisbane QLD 4000', lat: -27.4698, lng: 153.0251 },
];

export const companyProfileService = {
    async getLocations( _companyId: string ): Promise<ApiResponse<CompanyLocationPoint[]>>
    {
        // TODO: return await dataService.getAll<CompanyLocationPoint>( COMPANY_LOCATIONS_PATH, { where: { companyId } } );
        return Promise.resolve( { data: MOCK_LOCATIONS } );
    },
};
