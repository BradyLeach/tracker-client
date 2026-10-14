import { useIdentity } from '@/domains/account/identity/hooks/useIdentity';
import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { useProfile } from '@/core/context/profile/Profile.context';

/**
 * Reads the authenticated Identity from the store.
 * The id comes from the auth context the session was hydrated from; the profile gate
 * re-renders this on login and logout, and keeps the read idle outside a session.
 */
export function useCurrentIdentity()
{
    const { profile } = useProfile();
    return useIdentity( profile ? authenticationService.getIdentity()?.id : undefined );
}
