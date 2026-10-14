/**
 * Identity Service
 *
 * Domain store for identities. Reads come from the store as observables; writes go over
 * REST and are shredded back in, so every subscriber re-emits on its own.
 *
 * The authenticated Identity arrives with the auth context and is shredded in by
 * IdentityLoader once the store opens.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { Identity } from '../types/identity.types';

const MODEL = 'identity';
const PATH = 'account/identities';

export const identityService = createDomainStore<Identity>( {
    path: PATH,
    model: MODEL,
} );
