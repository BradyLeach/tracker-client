import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Typography, Stack, Link, Button } from '@/components/ui';

import bgImage from '@/assets/images/auth/page-verification.png';
import AuthPageContainer from '@/components/container/AuthPageContainer';
import { FormRendererProvideEmail } from '../components/FormRendererProvideEmail';
import { FormRendererProvideCode } from '../components/FormRendererProvideCode';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { formatApiError } from '@/core/utils';
import { registrationService } from '@/domains/authentication/services/registration.service';
import type { ProvideEmailFormFields, ProvideCodeFormFields } from '../types/formFields.types';

/**
 * Dialog type discriminator for type-safe dialog state management.
 *
 * - `'resend'`: Success dialog after resending verification code
 * - `'verification'`: Success dialog after successful email verification (triggers auto-redirect)
 * - `null`: No dialog displayed
 */
type DialogType = 'resend' | 'verification' | null;

/**
 * PageVerify - Email Verification Page
 *
 * Handles email verification during the registration flow. Supports two modes:
 *
 * **Mode 1: Email Collection (no email in URL)**
 * - User arrives without email parameter
 * - Shows email input form to collect user's email
 * - Redirects to Mode 2 after email submission
 *
 * **Mode 2: Code Verification (email in URL)**
 * - User arrives with email parameter (from registration or email link)
 * - Shows 6-digit code input form
 * - Validates code against backend
 * - Auto-redirects to login on success (5s delay or immediate via button)
 *
 * **Features:**
 * - Auto-redirect to login after successful verification (5 seconds)
 * - Manual redirect via "Continue" button
 * - Resend verification code functionality
 * - Type-safe dialog management (no brittle string comparisons)
 * - Centered error messages matching page layout
 *
 * **Flow:**
 * 1. User registers → receives email with verification link
 * 2. Clicks link → lands on this page with email parameter
 * 3. Enters 6-digit code → backend validates
 * 4. Success dialog appears → auto-redirect after 5s OR click "Continue"
 * 5. Redirects to `/auth/login`
 *
 * @returns Email verification page with conditional rendering based on email parameter
 */
export function PageVerify()
{
    // ==================== Hooks ====================
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    // ==================== State ====================

    /**
     * API error message to display in form feedback.
     * Translated via formatApiError() from backend error responses.
     */
    const [error, setError] = useState<string | undefined>( undefined );

    /**
     * Loading state for async operations (API calls).
     * Disables form inputs and shows loading indicators.
     */
    const [loading, setLoading] = useState( false );

    /**
     * Dialog type for success messages.
     * - `'verification'`: Triggers auto-redirect to login
     * - `'resend'`: Simple confirmation, no redirect
     * - `null`: No dialog shown
     */
    const [dialogType, setDialogType] = useState<DialogType>( null );

    /**
     * Countdown timer for auto-redirect (5 seconds).
     * Displays remaining seconds to user in verification success dialog.
     * Resets to 5 when verification succeeds.
     */
    const [countdown, setCountdown] = useState( 5 );

    // ==================== Derived State ====================

    /**
     * Email from URL query parameters.
     * Present when user arrives from registration or email link.
     * Missing when user navigates directly to this page.
     */
    const email = searchParams.get( 'email' );

    /**
     * i18n key prefix based on presence of email parameter.
     * Determines which content to display (email collection vs code verification).
     */
    const i18nKey = email ? 'pages.verifyEmail.provideCode' : 'pages.verifyEmail.provideEmail';

    // Page content strings
    const title = t( `${i18nKey}.title` );
    const subtitle = t( `${i18nKey}.subtitle` );
    const clickToResendText = t( `${i18nKey}.clickToResendText` );
    const clickToResendLink = t( `${i18nKey}.clickToResendLink` );

    // ==================== Effects ====================

    /**
     * Countdown timer for verification success dialog.
     *
     * When dialogType changes to 'verification':
     * - Resets countdown to 5
     * - Decrements every second
     * - Updates dialog message with remaining time
     *
     * Cleanup cancels interval if component unmounts or dialogType changes.
     */
    useEffect( () =>
    {
        if( dialogType === 'verification' )
        {
            // Reset countdown when verification succeeds
            setCountdown( 5 );

            // Decrement countdown every second
            const interval = setInterval( () =>
            {
                setCountdown( ( prev ) => prev - 1 );
            }, 1000 );

            // Cleanup: cancel interval if component unmounts or dialogType changes
            return () => clearInterval( interval );
        }
    }, [dialogType] );

    /**
     * Auto-redirect to login after countdown reaches 0.
     *
     * When countdown hits 0:
     * - Navigates to login page
     * - User can click "Continue" button for immediate redirect (bypasses countdown)
     *
     * This provides a better UX by:
     * - Giving user time to read success message
     * - Showing clear feedback on when redirect happens
     * - Allowing manual control via button
     * - Preventing redirect if user navigates away
     */
    useEffect( () =>
    {
        if( dialogType === 'verification' && countdown === 0 )
        {
            navigate( '/auth/login' );
        }
    }, [dialogType, countdown, navigate] );

    // ==================== Handlers ====================

    /**
     * Handles email submission when user manually navigates to this page.
     *
     * **Flow:**
     * 1. Updates URL with email parameter (enables Mode 2: Code Verification)
     * 2. Sends verification code to provided email via backend
     * 3. Shows error if request fails
     *
     * **Edge Case:**
     * User arrives without email parameter (direct navigation or bookmark).
     * This handler collects their email and redirects to code verification mode.
     *
     * @param data - Form data containing user's email address
     */
    const handleProvideEmail = async ( data: ProvideEmailFormFields ) =>
    {
        setLoading( true );
        setError( undefined );

        // Update URL with email parameter to switch to code verification mode
        navigate( `/auth/register/verify?email=${encodeURIComponent( data.email )}` );

        // Request new verification code from backend
        const response = await registrationService.requestNewCode( data );
        setLoading( false );

        // Display error if request fails
        if( response.error )
        {
            setError( formatApiError( t, response.error ) );
            return;
        }
    };

    /**
     * Handles verification code submission.
     *
     * **Flow:**
     * 1. Sends code + email to backend for validation
     * 2. Backend checks code matches, not expired, under attempt limit
     * 3. On success: activates account, shows dialog, triggers auto-redirect
     * 4. On failure: displays specific error (invalid, expired, max attempts)
     *
     * **Success Behavior:**
     * - Sets dialogType to 'verification'
     * - Triggers useEffect auto-redirect (5s delay)
     * - User can click "Continue" for immediate redirect
     *
     * **Error Handling:**
     * - Backend returns specific verification errors (verification.invalid, etc.)
     * - Errors displayed via FormScaffold.Feedback (center-aligned)
     *
     * @param data - Form data containing 6-digit verification code
     */
    const handleProvideCode = async ( data: ProvideCodeFormFields ) =>
    {
        setLoading( true );
        setError( undefined );

        // Verify code with backend (email from URL parameter)
        const response = await registrationService.verify( { ...data, email: email! } );
        setLoading( false );

        // Display error if verification fails
        if( response.error )
        {
            setError( formatApiError( t, response.error ) );
            return;
        }

        // Show success dialog (auto-redirect triggers via useEffect)
        setDialogType( 'verification' );
    };

    /**
     * Handles resend verification code request.
     *
     * **Use Case:**
     * - User didn't receive original verification email
     * - Verification code expired (15 minutes TTL)
     * - User exceeded max attempts with current code
     *
     * **Flow:**
     * 1. Revokes existing pending code for this email
     * 2. Generates new 6-digit code
     * 3. Sends new verification email
     * 4. Shows success dialog (no redirect)
     *
     * **Backend Behavior:**
     * - Only one pending code allowed per email at a time
     * - New code invalidates previous code
     * - Fresh attempt counter (0/5 attempts)
     */
    const handleResend = async () =>
    {
        setLoading( true );
        setError( undefined );

        // Request new verification code for this email
        const response = await registrationService.requestNewCode( { email: email! } );
        setLoading( false );

        // Display error if request fails
        if( response.error )
        {
            setError( formatApiError( t, response.error ) );
            return;
        }

        // Show success dialog (no redirect for resend)
        setDialogType( 'resend' );
    };

    /**
     * Handles dialog close action.
     *
     * **Behavior varies by dialog type:**
     * - `'verification'`: Immediately redirects to login (bypasses 5s auto-redirect)
     * - `'resend'`: Simply closes dialog (no navigation)
     * - `null`: No-op (dialog already closed)
     *
     * **Design Decision:**
     * Type-safe discriminator avoids brittle string comparisons.
     * Clear intent: verification success always navigates, resend success just closes.
     */
    const handleDialogClose = () =>
    {
        if( dialogType === 'verification' )
        {
            // Immediate redirect (don't wait for auto-redirect timer)
            navigate( '/auth/login' );
        }
        else
        {
            // Just close dialog (resend success)
            setDialogType( null );
        }
    };

    // ==================== Render ====================

    /**
     * Conditional Rendering: Email Collection Mode
     *
     * Renders when email parameter is missing from URL.
     * Shows email input form to collect user's email address.
     * After submission, redirects to code verification mode.
     */
    if( !email )
    {
        return (
            <AuthPageContainer title={title} description={subtitle} backgroundImage={bgImage}>
                <FormRendererProvideEmail
                    title={title}
                    subtitle={subtitle}
                    onSubmit={handleProvideEmail}
                    loading={loading}
                    error={error}
                />
            </AuthPageContainer>
        );
    }

    /**
     * Main Rendering: Code Verification Mode
     *
     * Renders when email parameter exists in URL.
     * Shows:
     * - Page header with title, subtitle, and user's email
     * - 6-digit code input form
     * - Resend code link
     * - Success dialog (verification or resend)
     */
    return (
        <AuthPageContainer title={title} description={subtitle} backgroundImage={bgImage}>
            <Stack spacing={3}>
                {/* Page Header - Center-aligned to match form layout */}
                <Stack spacing={1} alignItems='center'>
                    <Typography variant='h1' fontWeight={700}>
                        {title}
                    </Typography>
                    <Typography variant='subtitle1' color='text.secondary'>
                        {subtitle}
                    </Typography>
                    <Typography variant='subtitle1' fontWeight='700' color='text.secondary'>
                        {email}
                    </Typography>
                </Stack>

                {/* Verification Code Form */}
                <FormRendererProvideCode
                    onSubmit={handleProvideCode}
                    loading={loading}
                    error={error}
                />

                {/* Resend Code Link */}
                <Typography align='center' color="text.secondary" variant="h6" fontWeight="400">
                    {t( clickToResendText )}{'  '}
                    <Link
                        component="button"
                        onClick={handleResend}
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                    >
                        {t( clickToResendLink )}
                    </Link>
                </Typography>
            </Stack>

            {/* Success Dialog - Auto-redirects for verification success */}
            <MessageDialog
                open={dialogType !== null}
                onClose={handleDialogClose}
                actions={
                    <Button
                        onClick={handleDialogClose}
                        variant="contained"
                        color="primary"
                    >
                        {/* Different button labels based on dialog type */}
                        {dialogType === 'verification' ? t( 'shared.buttons.continue' ) : t( 'shared.buttons.close' )}
                    </Button>
                }
            >
                <Stack spacing={2} alignItems="center">
                    <Typography>
                        {/* Different messages based on dialog type */}
                        {dialogType === 'verification'
                            ? t( 'pages.verifyEmail.dialogs.verificationSuccess' )
                            : t( 'pages.verifyEmail.dialogs.resendSuccess' )}
                    </Typography>
                    {/* Show countdown timer for verification success */}
                    {dialogType === 'verification' && (
                        <Typography variant="body2" color="text.secondary">
                            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </Typography>
                    )}
                </Stack>
            </MessageDialog>
        </AuthPageContainer>
    );
}
