/**
 * Company Service
 *
 * Reads come from the store and are returned as observables — immediately, whether or not
 * anything is held yet. Writes go over REST and are shredded back in, so every subscriber
 * re-emits on its own. There is no cache to invalidate.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DeleteRestoreResult } from '@/services/domain/createDomainStore';
import { httpDataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { Company } from '../types/company.types';

const PATH = 'business/companies';
const COMPANY_INCLUDES = ['partnership'];

/**
 * Partnerships arrive nested and are shredded into their own table, which is what makes a
 * company read fill the partnership collection too.
 *
 * Both include sets are stated. A detail read does not inherit the list read's, because a
 * missing relation renders as a blank field rather than an error.
 */
export const companyService = {
    ...createDomainStore<Company>( {
        path: PATH,
        model: 'company',
        collectionIncludes: COMPANY_INCLUDES,
        recordIncludes: COMPANY_INCLUDES,
    } ),

    /**
     * Trashed companies, read straight from the server through `httpDataService` — the plain,
     * uncached `DataService` implementation — rather than the store or `dataService`.
     *
     * `includeDeleted` lifts the paranoid filter; the deletedAt predicate selects only
     * trashed rows. This deliberately bypasses the domain store: the store holds no
     * client-side `deletedAt`, and trash is an explicit management view.
     */
    async listDeleted(): Promise<ApiResponse<Company[]>>
    {
        const deleted: Company[] = [];
        let page = 1;
        let response: ApiResponse<Company[]>;

        do
        {
            response = await httpDataService.query<Company>( PATH, {
                where: { deletedAt: { not: null } },
                includeDeleted: true,
                includes: COMPANY_INCLUDES,
                includeMeta: true,
                page,
            } );

            if( response.error ) return response;

            deleted.push( ...( response.data ?? [] ) );
            page += 1;
        }
        while( response.meta?.hasMore );

        return { ...response, data: deleted };
    },

    /**
     * Permanently deletes a trashed company — `hard=true` on the same delete endpoint, per
     * the backend's own delete-type contract (`checkDeleteType.js`). There is no cascade
     * response to shred and nothing left to tombstone: the row is gone, not soft-deleted, so
     * this goes through `httpDataService` like the rest of trash and leaves the caller to
     * drop the row from whatever local list it came from.
     */
    async hardDelete( id: string ): Promise<ApiResponse<DeleteRestoreResult>>
    {
        return httpDataService.delete<DeleteRestoreResult>( `${PATH}/${id}`, undefined, { hard: true } );
    },
};
