/**
 * PageLogin.tsx
 *
 * Login page for the application. Handles form state, error display, and delegates
 * authentication to handler logic.
 */
import AuthPageContainer from '@/components/container/AuthPageContainer';
import bgImage from '@/assets/images/auth/page-registration.png';

// import { Card } from '@mui/material';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LoginFormRenderer } from '../components/LoginFormRenderer';
import { formatApiError } from '@/core/utils';
import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { hydrateFromAuthContext } from '@/core/context/hydration/hydrateFromAuthContext';

import type { LoginFormFields } from '../types/formFields.types';

/**
 * Renders the login page and orchestrates form submission logic.
 *
 * @returns Login page component
 */
export function PageLogin()
{
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState<string | undefined>( undefined );
    const [loading, setLoading] = useState( false );

    const onSubmit = async ( fields: LoginFormFields ) =>
    {
        setLoading( true );
        setError( undefined );

        // Try to login with the backend.
        const response = await authenticationService.login( fields );
        setLoading( false );

        // If and error is returned, set it on the form.
        if( response.error )
        {
            setError( formatApiError( t, response.error ) );
            return;
        }

        // No error means login succeeded — hydrate and navigate
        // Hydrate auth context (profile, preferences, menu)
        await hydrateFromAuthContext();

        navigate( `/home`, { state: {} } );
    };

    return (
        <AuthPageContainer title="Login" description="this is Login page" backgroundImage={bgImage}>
            {/* <Card sx={{ p: 4, width: '100%', maxWidth: 450 }}> */}
            <LoginFormRenderer
                title="Welcome back to Trace-Ability" // NEED TO UPDATE TO I18n
                subtitle="Enter your email and password to login."
                onSubmit={onSubmit}
                loading={loading}
                error={error}
            />
            {/* </Card> */}
        </AuthPageContainer>
    );
}