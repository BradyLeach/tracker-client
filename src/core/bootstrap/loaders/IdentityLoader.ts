import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { identityService } from '@/domains/account/identity/services/identity.service';
import type { BootstrapLoader } from '../types';

/**
 * Shreds the authenticated Identity into the store.
 *
 * The auth context already carried it; the store was not open when it arrived. Critical:
 * an authenticated session without its Identity is a failed initialisation, not a read to
 * retry later.
 */
export class IdentityLoader implements BootstrapLoader<void>
{
    name = 'identity';
    critical = true;

    async load(): Promise<void>
    {
        const identity = authenticationService.getIdentity();

        if( !identity ) throw new Error( 'No authenticated identity to load' );

        const response = await identityService.mutate( () => Promise.resolve( { data: identity } ) );

        if( response.error ) throw new Error( 'Identity could not be stored' );
    }
}
