import { getProfileSetters } from './Profile.context';
import type { ProfileContextShape } from '../types';

/**
 * Hydrates selected values in the runtime profile context.
 *
 * Properties are applied only when explicitly present, allowing callers to
 * distinguish between "not provided" and an explicit `undefined` used to clear
 * the current value.
 */
export const profileHydrator = {
    /**
     * Applies profile context values supplied by authentication/session hydration.
     *
     * @param data - Profile context values to hydrate or explicitly clear.
     */
    hydrate( data: Partial<ProfileContextShape> )
    {
        const setters = getProfileSetters();

        if( 'profile' in data )
            setters.setProfile?.( data.profile );

        if( 'appPreferenceId' in data )
            setters.setAppPreferenceId?.( data.appPreferenceId );
    }
} as const;
