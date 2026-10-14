/**
 * Geo Reference Services
 *
 * Country, currency and language behind the authentication boundary. They are entity
 * records with uuids, so they live in the entity store like everything else — the section
 * 2.9 criterion, not a special case.
 *
 * These read the ordinary CRUD routes rather than the public `system/controllers/*`
 * endpoints. Those project (`id`, `code`, `label` only), and a projected record overwriting
 * a whole one is the single shape hazard the shredder cannot defend against. The public
 * endpoints stay where they are, serving the pre-auth path, and their responses are never
 * shredded.
 *
 * Each collection confirms its own scope, rather than one country read with includes
 * claiming completeness for currencies it never asked for.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { SystemCountry, SystemCurrency, SystemLanguage } from '../types/reference.types';

/**
 * Countries, with the subdivisions and region that hang off each one.
 *
 * The includes are what make a country-then-subdivision picker a local traversal: the
 * subdivisions arrive with the country that owns them, so choosing a country needs no
 * second request.
 */
export const countryService = createDomainStore<SystemCountry>( {
    path: 'admin/system/countries',
    model: 'country',
    collectionIncludes: ['subdivision', 'region'],
    recordIncludes: ['subdivision', 'region'],
} );

export const currencyService = createDomainStore<SystemCurrency>( {
    path: 'admin/system/currencies',
    model: 'currency',
} );

export const languageService = createDomainStore<SystemLanguage>( {
    path: 'admin/system/languages',
    model: 'language',
} );
