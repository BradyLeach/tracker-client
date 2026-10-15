/**
 * Measurement Source Service
 *
 * Every way measurements reach the account — push, manual entry, and one source per
 * connector — with the allowed set of measurement names and dimension keys each accepts.
 * Metric and attribution filter builders read their dimension keys from here.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { MeasurementSource } from '../types/measurementSource.types';

const MODEL = 'measurementSource';
const PATH = 'measurement/sources';

const base = createDomainStore<MeasurementSource>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const measurementSourceService = {
    ...base,
};
