/**
 * useAccountReportingDefaults
 *
 * The account's reporting defaults, read from the store — at most one record, undefined
 * when the account has none and its results group in UTC.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { accountReportingDefaultsService } from '../services/accountReportingDefaults.service';
import type { AccountReportingDefaults } from '../types/accountReportingDefaults.types';

export function useAccountReportingDefaults()
{
    const query = useDataQuery<AccountReportingDefaults[]>( () => accountReportingDefaultsService.observeAll(), [] );

    return { ...query, data: query.data?.[0] };
}
