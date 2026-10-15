/**
 * useMeasurementsBySource
 *
 * The measurements of one source, read from the store. Stays idle until a source is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { measurementService } from '../services/measurement.service';
import type { Measurement } from '../types/measurement.types';

export function useMeasurementsBySource( measurementSourceId: string | null )
{
    return useDataQuery<Measurement[]>(
        () => measurementSourceId ? measurementService.observeBySource( measurementSourceId ) : undefined,
        [measurementSourceId],
    );
}
