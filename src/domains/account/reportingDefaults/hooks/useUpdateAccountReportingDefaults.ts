import { useDataMutation } from '@/services/domain/useDataQuery';
import { accountReportingDefaultsService } from '../services/accountReportingDefaults.service';
import type { AccountReportingDefaults } from '../types/accountReportingDefaults.types';

export function useUpdateAccountReportingDefaults( id: string )
{
    return useDataMutation<AccountReportingDefaults, Partial<AccountReportingDefaults>>( async ( data ) =>
    {
        const response = await accountReportingDefaultsService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
