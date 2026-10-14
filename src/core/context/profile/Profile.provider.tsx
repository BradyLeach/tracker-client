import { useState, useLayoutEffect, type ReactNode } from 'react';
import type { Profile } from '@/domains/account/profile/types/profile.types';
import { ProfileContext, syncProfileState } from './Profile.state';

/**
 * Profile Provider
 * Initializes with empty state, hydrated from backend post-auth
 */
export function ProfileProvider( { children }: { children: ReactNode } )
{
    const [profile, setProfile] = useState<Profile | undefined>( undefined );
    const [appPreferenceId, setAppPreferenceId] = useState<string | undefined>( undefined );
    const [hydrationComplete, setHydrationComplete] = useState<boolean>( false );

    // Publish committed state on mount and when snapshot values change.
    // Setter references are stable; hydrationComplete is routing-only state.
    useLayoutEffect( () =>
    {
        syncProfileState(
            { profile, appPreferenceId },
            { setProfile, setAppPreferenceId, setHydrationComplete }
        );
    }, [profile, appPreferenceId, setProfile, setAppPreferenceId, setHydrationComplete] );

    return (
        <ProfileContext.Provider value={{
            profile,
            appPreferenceId,
            setProfile,
            setAppPreferenceId,
            setHydrationComplete,
            hydrationComplete
        }}>
            {children}
        </ProfileContext.Provider>
    );
}
