/**
 * useMeasurements
 *
 * Every measurement the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { measurementService } from '../services/measurement.service';
import type { Measurement } from '../types/measurement.types';

export function useMeasurements()
{
    return useDataQuery<Measurement[]>( () => measurementService.observeAll(), [] );
}
