/**
 * Metric Service
 *
 * Declarative aggregations over one source's measurements. A metric's value is computed
 * by the server at read time and is never stored, so it is fetched, not observed.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { MetricValues, ResultGrouping } from '../types/metric.types';
import type { Metric } from '../types/metric.types';

const MODEL = 'metric';
const PATH = 'metric/metrics';

const base = createDomainStore<Metric>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const metricService = {
    ...base,

    /** A metric's value over its rolling window, with a trend when a grouping is given. */
    getValues( id: string, groupBy?: ResultGrouping ): Promise<ApiResponse<MetricValues>>
    {
        return dataService.post<MetricValues>( `${PATH}/values`, { id, groupBy } );
    },
};
