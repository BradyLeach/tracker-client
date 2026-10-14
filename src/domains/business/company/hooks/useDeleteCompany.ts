/**
 * useDeleteCompany
 *
 * Deleting a company takes its partnerships with it. The server resolves that set and
 * returns it, and the domain store removes every record it names — so the partnership rows
 * disappear from the store with the company, and every subscriber re-emits on its own.
 *
 * A soft delete: the records are recoverable until something hard deletes them.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { companyService } from '../services/company.service';
import type { DeleteRestoreResult } from '@/services/domain/createDomainStore';

const EMPTY_RESULT: DeleteRestoreResult = { records: { primary: [], related: [] } };

export function useDeleteCompany()
{
    return useDataMutation<DeleteRestoreResult, string>( async ( id ) =>
    {
        const response = await companyService.remove( id );

        if( response.error ) throw response.error;

        return response.data ?? EMPTY_RESULT;
    } );
}
