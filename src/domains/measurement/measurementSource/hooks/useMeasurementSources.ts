/**
 * useMeasurementSources
 *
 * Every measurement source the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { measurementSourceService } from '../services/measurementSource.service';
import type { MeasurementSource } from '../types/measurementSource.types';

export function useMeasurementSources()
{
    return useDataQuery<MeasurementSource[]>( () => measurementSourceService.observeAll(), [] );
}
