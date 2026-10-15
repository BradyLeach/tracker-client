import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getConfig } from '@/config';
import { FullPageError } from '@/components/pages/FullPageError';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { lazy } from 'react';

// Lazy load pages
const Landing = lazy( () => import( '@/domains/marketing' ).then( module => ( { default: module.Landing } ) ) );
const PageLogin = lazy( () => import( '@/domains/authentication' ).then( module => ( { default: module.PageLogin } ) ) );
const PageRegistration = lazy( () => import( '@/domains/authentication' ).then( module => ( { default: module.PageRegistration } ) ) );
const PageVerify = lazy( () => import( '@/domains/authentication' ).then( module => ( { default: module.PageVerify } ) ) );
const PageProfile = lazy( () => import( '@/domains/profile' ).then( module => ( { default: module.PageProfile } ) ) );
const PageAccountSettings = lazy( () => import( '@/domains/account' ).then( module => ( { default: module.PageAccountSettings } ) ) );
const PageAccount = lazy( () => import( '@/domains/account' ).then( module => ( { default: module.PageAccount } ) ) );
const PageHome = lazy( () => import( '@/domains/dashboards' ).then( module => ( { default: module.PageHome } ) ) );
const PageCompanies = lazy( () => import( '@/domains/business' ).then( module => ( { default: module.PageCompanies } ) ) );
const PageExperiments = lazy( () => import( '@/domains/experiment' ).then( module => ( { default: module.PageExperiments } ) ) );
const PageMetrics = lazy( () => import( '@/domains/metric' ).then( module => ( { default: module.PageMetrics } ) ) );
const PageCalculators = lazy( () => import( '@/domains/calculator' ).then( module => ( { default: module.PageCalculators } ) ) );
const PageConnections = lazy( () => import( '@/domains/connector' ).then( module => ( { default: module.PageConnections } ) ) );
const PageSources = lazy( () => import( '@/domains/measurement' ).then( module => ( { default: module.PageSources } ) ) );
const PageIngestKeys = lazy( () => import( '@/domains/ingest' ).then( module => ( { default: module.PageIngestKeys } ) ) );
const PageBullseye = lazy( () => import( '@/domains/bullseye' ).then( module => ( { default: module.PageBullseye } ) ) );
const PageExperiment = lazy( () => import( '@/domains/experiment' ).then( module => ( { default: module.PageExperiment } ) ) );

// Get the runtime environment for the config helper
const { environment, features } = getConfig();

// Remove Development and Test tools
const PageCompanyProfile = lazy( () =>
    import( '@/domains/business/pages/PageCompanyProfile' ).then( module => ( { default: module.PageCompanyProfile } ) )
);
const PageCompaniesTrash = lazy( () =>
    import( '@/domains/business/pages/PageCompaniesTrash' ).then( module => ( { default: module.PageCompaniesTrash } ) )
);
const PageDataDevTools = lazy( () =>
    import( '@/devTools/pages/PageDataDevTools' ).then( module => ( { default: module.PageDataDevTools } ) )
);
const PageMenuDevTools = lazy( () =>
    import( '@/devTools/pages/PageMenuDevTools' ).then( module => ( { default: module.PageMenuDevTools } ) )
);
const PageUIDevTools = lazy( () =>
    import( '@/devTools/pages/PageUIDevTools' ).then( module => ( { default: module.PageUIDevTools } ) )
);
const PageDomainDevTools = lazy( () =>
    import( '@/devTools/pages/PageDomainDevTools' ).then( module => ( { default: module.PageDomainDevTools } ) )
);

/**
 * Root error element for all routes
 * Catches errors in any route component without needing errorElement on each route
 */
const RootErrorBoundary = () => <FullPageError />;

/**
 * Router with root-level error handling
 */
export const router = createBrowserRouter( [
    {
        errorElement: <RootErrorBoundary />,
        children: [
            // Public Pages
            { path: "/", element: <Landing /> },

            // Auth Pages
            { path: "/auth/login", element: <PageLogin /> },
            { path: "/auth/register", element: <PageRegistration /> },
            { path: "/auth/register/verify", element: <PageVerify /> },

            // Authenticated Pages — guarded by AuthGuard layout route
            {
                element: <AuthGuard />,
                children: [
                    { path: "/profile", element: <PageProfile /> },
                    { path: "/account/settings", element: <PageAccountSettings /> },
                    { path: "/account/account", element: <PageAccount /> },
                    { path: "/home", element: <PageHome /> },
                    { path: "/partnerships", element: <PageCompanies /> },
                    { path: "/partnerships/trash", element: <PageCompaniesTrash /> },
                    { path: "/partnerships/:companyId", element: <PageCompanyProfile /> },
                    { path: "/experiments", element: <PageExperiments /> },
                    { path: "/experiments/:experimentId", element: <PageExperiment /> },
                    { path: "/metrics", element: <PageMetrics /> },
                    { path: "/calculators", element: <PageCalculators /> },
                    { path: "/connections", element: <PageConnections /> },
                    { path: "/sources", element: <PageSources /> },
                    { path: "/ingest-keys", element: <PageIngestKeys /> },
                    { path: "/bullseye", element: <PageBullseye /> },
                ]
            },

            // Development tools pages
            ...( environment === 'development' || features.devTools
                ? [
                    { path: 'admin/devTools', element: <Navigate to="/admin/devTools/data" replace /> },
                    { path: 'admin/devTools/data', element: <PageDataDevTools /> },
                    { path: 'admin/devTools/menu', element: <PageMenuDevTools /> },
                    { path: 'admin/devTools/ui', element: <PageUIDevTools /> },
                    { path: 'admin/devTools/domains', element: <PageDomainDevTools /> },
                ]
                : [] ),

            // 404 fallback
            {
                path: "*", element: <FullPageError errorId='404' />
            },
        ]
    }
] );
