/**
 * useMeasurementSource
 *
 * One measurement source by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { measurementSourceService } from '../services/measurementSource.service';
import type { MeasurementSource } from '../types/measurementSource.types';

export function useMeasurementSource( id: string | null )
{
    return useDataQuery<MeasurementSource | undefined>(
        () => id ? measurementSourceService.observeById( id ) : undefined,
        [id],
    );
}
