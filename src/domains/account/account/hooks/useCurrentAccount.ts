import { useProfile } from '@/core/context/profile/Profile.context';
import { useAccount } from './useAccount';

/** Resolves the authenticated profile's owning account by its account ID. */
export function useCurrentAccount()
{
    const { profile } = useProfile();
    return useAccount( profile?.ownerId );
}
