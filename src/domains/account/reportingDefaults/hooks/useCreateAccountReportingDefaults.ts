import { useDataMutation } from '@/services/domain/useDataQuery';
import { accountReportingDefaultsService } from '../services/accountReportingDefaults.service';
import type { AccountReportingDefaults } from '../types/accountReportingDefaults.types';

/**
 * Creates a reporting defaults record. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateAccountReportingDefaults()
{
    return useDataMutation<AccountReportingDefaults, Partial<AccountReportingDefaults>>( async ( data ) =>
    {
        const response = await accountReportingDefaultsService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
