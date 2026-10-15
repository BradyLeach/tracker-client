/**
 * useMetric
 *
 * One metric by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { metricService } from '../services/metric.service';
import type { Metric } from '../types/metric.types';

export function useMetric( id: string | null )
{
    return useDataQuery<Metric | undefined>(
        () => id ? metricService.observeById( id ) : undefined,
        [id],
    );
}
