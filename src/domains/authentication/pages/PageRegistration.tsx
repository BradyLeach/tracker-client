import AuthPageContainer from '@/components/container/AuthPageContainer';
import bgImage from '@/assets/images/auth/page-registration.png';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { RegistrationFormRenderer } from '../components/RegistrationFormRenderer';
import { formatApiError } from '@/core/utils';
import { registrationService } from '@/domains/authentication/services/registration.service';

import type { RegistrationFormFields } from '../types/formFields.types';

/**
 * Registration Page
 *
 * Single-page registration form for new users.
 * Collects identity details, company name, credentials, and T&C acceptance.
 *
 * **Flow:**
 * 1. User fills out registration form
 * 2. On submit, calls registration service
 * 3. On success, navigates to email verification page
 * 4. On error, displays translated error via RegistrationFormRenderer
 */
export function PageRegistration()
{
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState<string | undefined>( undefined );
    const [loading, setLoading] = useState( false );

    const onSubmit = async ( fields: RegistrationFormFields ) =>
    {
        setLoading( true );
        setError( undefined );

        const response = await registrationService.register( fields );

        setLoading( false );

        if( response.error )
        {
            setError( formatApiError( t, response.error ) );
            return;
        }

        if( response.data )
        {
            navigate( `/auth/register/verify?email=${encodeURIComponent( response.data.email )}`, {
                state: { message: `Welcome ${response.data.email}` }
            } );
        }
    };

    return (
        <AuthPageContainer title="pages.registration.title" description="pages.registration.subtitle" backgroundImage={bgImage}>
            <RegistrationFormRenderer
                title="pages.registration.title"
                subtitle="pages.registration.subtitle"
                onSubmit={onSubmit}
                loading={loading}
                error={error}
            />
        </AuthPageContainer>
    );
}
