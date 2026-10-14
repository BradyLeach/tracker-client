/**
 * ContextDefaults Component
 *
 * Post-render hydration component (runs inside all context providers).
 *
 * 1. Hydrates IP-based defaults (language, currency, country, theme)
 * 2. If AuthLoader (bootstrap) provided a token, hydrates auth context
 * 3. If no token from bootstrap, stays with defaults (no fallback refresh)
 *
 * Bootstrap is the single authority for initial token refresh.
 * Interceptor handles 401 refresh on protected requests.
 *
 * Follows the pattern of I18nSync—a post-render hydration component.
 */

import { useEffect } from 'react';
import { hydrateFromDefaults } from './hydration/hydrateFromDefaults';
import { hydrateFromAuthContext } from './hydration/hydrateFromAuthContext';
import { useProfile, getProfileSetters, getProfileState } from './profile/Profile.context';
import { initialiseSession } from '@/core/bootstrap/initialiseSession';
import { tokenStore } from '@/services/http/tokenStore';

export function ContextDefaults( { children }: { children: React.ReactNode } )
{
    const { profile } = useProfile();
    const profileId = profile?.id;

    // Initial hydration on app mount
    useEffect( () =>
    {
        let cancelled = false;

        async function hydrate()
        {
            await hydrateFromDefaults();

            if( cancelled ) return;

            // Bootstrap is the authority for initial token refresh.
            // If bootstrap succeeded, token is in tokenStore.
            // If bootstrap failed, stay with defaults.
            // Interceptor handles 401 refresh on protected requests.
            if( tokenStore.get() )
            {
                await hydrateFromAuthContext();

                if( cancelled ) return;

                // The post-login half of bootstrap: full model definitions, the store,
                // then reference data. Runs before hydrationComplete, so the spinner the
                // guards already show covers it rather than the app rendering half-loaded.
                const profileId = getProfileState().profile?.id;
                if( profileId )
                {
                    await initialiseSession( profileId );
                }
            }

            if( cancelled ) return;

            // Signal to route guards that initial hydration is complete.
            // Called on both authenticated and unauthenticated paths.
            getProfileSetters().setHydrationComplete?.( true );
        }

        void hydrate();

        return () => { cancelled = true; };
    }, [] );

    // Re-hydrate preferences whenever user logs in
    // This ensures user preferences override localStorage on every login
    useEffect( () =>
    {
        // Only re-hydrate when user logs in (transition from undefined to a profile ID)
        if( !profileId ) return;

        let cancelled = false;

        async function hydrateProfile( profileId: string )
        {
            await hydrateFromAuthContext();

            if( cancelled ) return;

            // Logging in from the form reaches this path rather than the mount effect, and
            // the routes are already unlocked by the time it does. Hydration is reopened for
            // the duration so the guard holds the initialising page up: the store is what
            // every authenticated page reads from, and a route rendered before it is open
            // subscribes to nothing and stays empty until a refresh.
            //
            // initialiseSession is idempotent, so arriving here after the mount effect has
            // already run joins that sequence rather than repeating it.
            getProfileSetters().setHydrationComplete?.( false );

            try
            {
                await initialiseSession( profileId );
            }
            finally
            {
                if( !cancelled ) getProfileSetters().setHydrationComplete?.( true );
            }
        }

        void hydrateProfile( profileId );

        return () => { cancelled = true; };
    }, [profileId] );

    return <>{children}</>;
}
