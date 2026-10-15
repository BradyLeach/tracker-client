/**
 * useMetrics
 *
 * Every metric the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { metricService } from '../services/metric.service';
import type { Metric } from '../types/metric.types';

export function useMetrics()
{
    return useDataQuery<Metric[]>( () => metricService.observeAll(), [] );
}
