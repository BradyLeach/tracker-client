/**
 * useMeasurement
 *
 * One measurement by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { measurementService } from '../services/measurement.service';
import type { Measurement } from '../types/measurement.types';

export function useMeasurement( id: string | null )
{
    return useDataQuery<Measurement | undefined>(
        () => id ? measurementService.observeById( id ) : undefined,
        [id],
    );
}
