/**
 * Formula Service
 *
 * User formulas: restricted expressions over the account's metric keys. The server
 * parses every expression when it is saved and rejects one it cannot evaluate.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { Formula } from '../types/formula.types';

const MODEL = 'formula';
const PATH = 'metric/formulas';

const base = createDomainStore<Formula>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const formulaService = {
    ...base,
};
