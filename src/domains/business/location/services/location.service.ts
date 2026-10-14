/**
 * Location Service
 *
 * Domain store for locations. Reads come from the store as observables; writes go over
 * REST and are shredded back in. locationType is included and composed so every
 * observer receives the hydrated type alongside the location.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { joinOne } from '@/services/domain/joins';
import type { SystemType } from '@/domains/system/types/systemType.types';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Location } from '../types/location.types';

const MODEL = 'location';
const PATH = 'business/locations';

const base = createDomainStore<Location>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: ['locationType'],
    recordIncludes: ['locationType'],
    compose: rows => joinOne<Location, SystemType, 'locationType'>( MODEL, rows, 'locationType', 'locationType' ),
} );

export const locationService = {
    ...base,

    /**
     * The locations of one company, each with its locationType attached.
     *
     * The scope filter is passed too, so a company read that included its locations has
     * already satisfied this edge and the traversal is a local indexed read.
     */
    observeByCompany( companyId: string ): DataQuerySource<Location[]>
    {
        return base.observeWhere( { companyId }, { companyId } );
    },
};
