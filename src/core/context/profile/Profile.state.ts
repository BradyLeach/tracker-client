/**
 * Profile Context
 *
 * Runtime profile state - hydrated from backend post-auth.
 * - useProfile() for React components (triggers re-renders)
 * - getProfileState() for services/loggers (read-only snapshot)
 * - getProfileSetters() for hydration (setter refs)
 */

import { createContext, useContext } from 'react';
import type { ProfileContextShape } from '../types';
import type { Profile } from '@/domains/account/profile/types/profile.types';

// Default state for safety before useLayoutEffect runs
const DEFAULT_PROFILE_STATE: ProfileContextShape = {
    profile: undefined,
    appPreferenceId: undefined,
};

// Module-scope refs (accessible outside React)
let profileState: ProfileContextShape = DEFAULT_PROFILE_STATE;
let profileSetters: {
    setProfile?: ( v: Profile | undefined ) => void;
    setAppPreferenceId?: ( v: string | undefined ) => void;
    setHydrationComplete?: ( v: boolean ) => void;
} = {};

// Context value type includes state + setters
// hydrationComplete is routing-only state — not part of ProfileContextShape
interface ProfileContextValue extends ProfileContextShape
{
    setProfile: ( v: Profile | undefined ) => void;
    setAppPreferenceId: ( v: string | undefined ) => void;
    setHydrationComplete: ( v: boolean ) => void;
    hydrationComplete: boolean;
}

/**
 * Shared React context for the single authenticated profile, preferences, and routing hydration state.
 * Consumers must be rendered inside ProfileProvider; use useProfile() to read this context.
 */
export const ProfileContext = createContext<ProfileContextValue>( undefined! );

/**
 * Synchronizes the runtime snapshot and setter references with the provider.
 *
 * Called by ProfileProvider's useLayoutEffect on mount and when synchronized values change.
 * Setter references are stable; routing-only hydrationComplete changes need no snapshot update.
 * This keeps non-React consumers reading committed state and gives hydration
 * and logout access to the provider's setters without changing render state.
 *
 * @param state - Current profile and app preference ID.
 * @param setters - Provider setters for profile, preferences, and hydration status.
 */
export function syncProfileState( state: ProfileContextShape, setters: typeof profileSetters ): void
{
    profileState = state;
    profileSetters = setters;
}

/**
 * Hook for React components (triggers re-renders on change).
 * Must be called inside ProfileProvider.
 *
 * @returns The current profile, app preference ID, routing hydration status, and their setters.
 * Profile and app preference ID are undefined before authentication hydration or after logout.
 */
export const useProfile = () => useContext( ProfileContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation.
 * Updated after provider commits; reading this snapshot does not subscribe to React updates.
 * The freeze is shallow: it protects the snapshot fields, not the nested profile object.
 *
 * @returns The last committed profile and app preference ID, without routing state or setters.
 */
export const getProfileState = (): Readonly<ProfileContextShape> =>
    Object.freeze( { ...profileState } );

/**
 * Setter refs for hydration and logout.
 * Returns an empty object before the provider's first layout effect; use optional calls.
 *
 * @returns Setters for profile, app preference ID, and routing hydration status.
 */
export const getProfileSetters = () => profileSetters;
