/**
 * useCountries Hook
 *
 * Countries from the entity store, behind the authentication boundary.
 *
 * The store is opened per profile after login, so this is only usable once a session
 * exists. An unauthenticated caller — the registration form is the only one — reads the
 * public catalog through usePublicCountries instead.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { countryService } from '../services/geo.service';
import type { SystemCountry } from '../types/reference.types';

export function useCountries()
{
    return useDataQuery<SystemCountry[]>( () => countryService.observeAll(), [] );
}
