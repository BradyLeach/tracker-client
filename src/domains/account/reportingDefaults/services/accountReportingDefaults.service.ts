/**
 * Account Reporting Defaults Service
 *
 * The account's reporting time zone: where day, week and month boundaries fall when
 * results and trends are grouped. One record per account; UTC when there is none.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { AccountReportingDefaults } from '../types/accountReportingDefaults.types';

const MODEL = 'accountReportingDefaults';
const PATH = 'account/reporting-defaults';

const base = createDomainStore<AccountReportingDefaults>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const accountReportingDefaultsService = {
    ...base,
};
