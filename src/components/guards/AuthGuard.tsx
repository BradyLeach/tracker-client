import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '@/core/context';
import { FullPageLoading } from '@/components/pages/FullPageLoading';

/**
 * AuthGuard — Layout route wrapper for authenticated pages.
 *
 * Waits for initial hydration to complete before making an auth decision.
 * This prevents false redirects to login while the bootstrap token refresh
 * and context hydration are still in progress.
 *
 * Hydration is not complete until the post-login sequence has run, because that is what
 * opens the entity store every authenticated page reads from. Rendering a route before then
 * subscribes to a store that is not there, and the page stays empty until a refresh.
 *
 * States:
 *   - hydrationComplete=false → show the initialising page (hydration in progress)
 *   - hydrationComplete=true, no profile → redirect to login
 *   - hydrationComplete=true, profile set → render route
 */
export function AuthGuard()
{
    const { hydrationComplete, profile } = useProfile();

    if( !hydrationComplete )
    {
        return <FullPageLoading />;
    }

    if( !profile?.id )
    {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
}
