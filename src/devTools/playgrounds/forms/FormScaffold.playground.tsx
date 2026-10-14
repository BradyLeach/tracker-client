/**
   * FormScaffold Playground - Interactive Testing Environment
   *
   * Interactive testbed demonstrating FormScaffold slot architecture with BaseFormRenderer.
   * Allows developers to test all form field types, validation, and slot compositions
   * with live controls to toggle different UI states.
   *
   * Key Demonstrations:
   * - FormScaffold slot system (Header, Feedback, Message, Meta, Body, Actions, Footer)
   * - BaseFormRenderer with config-driven forms
   * - Yup validation with live error feedback
   * - All form field types (text, email, password, number, date, select, slider)
   * - Responsive layout (controls top on mobile, sidebar on desktop)
   * - Form state management (loading, success, error states)
   *
   * Responsive Behavior:
   * - Mobile (< 900px): Controls stacked above form, full width
   * - Desktop (≥ 900px): Controls sidebar on left, form on right (max 600px)
   * - Large screens: Centered with max 1200px container
   *
   * Form Field Types Tested:
   * - text: Username input
   * - email: Email validation
   * - password: Secure password input
   * - number: Age with min/max constraints
   * - date: Birthdate picker
   * - select: Account type dropdown
   * - slider: Experience level (0-10 range)
   *
   * Usage for New Developers:
   * 1. Use controls to toggle error/message states
   * 2. Submit form to see validation in action
   * 3. Observe FormScaffold slot rendering order
   * 4. Check submitted data in JSON preview
   * 5. Test on different screen sizes for responsive behavior
   */
import { useState } from 'react';
import { Box, Button, Chip, Typography, Stack, Card } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import type { FormConfig } from '@/components/forms/types/formConfig.types';
import * as yup from 'yup';

export function PageFormPlayground()
{
    /**
   * Form state management
   *
   * Controls UI state for demonstration purposes:
   * - loading: Simulates async form submission (1.5s delay)
   * - showError: Toggles Feedback slot with error severity
   * - showMessage: Toggles Message slot with custom React content
   * - showSuccess: Toggles Feedback slot with success severity
   * - formData: Captures last submitted form data for JSON preview
   */
    const [loading, setLoading] = useState( false );
    const [showError, setShowError] = useState( false );
    const [showMessage, setShowMessage] = useState( false );
    const [showMeta, setShowMeta] = useState( false );
    const [showSuccess, setShowSuccess] = useState( false );
    const [formData, setFormData] = useState<any>( null );

    /**
   * Yup validation schema
   *
   * Demonstrates validation rules for all field types:
   * - String validation: required, min length, email format
   * - Number validation: required, min/max bounds
   * - Date validation: required birthdate
   *
   * BaseFormRenderer automatically integrates this schema via FormConfig.
   * Validation errors display inline below each field.
   */
    const validationSchema = yup.object( {
        username: yup.string().required( 'Username is required' ).min( 3, 'Min 3 characters' ),
        email: yup.string().required( 'Email is required' ).email( 'Invalid email' ),
        password: yup.string().required( 'Password is required' ).min( 8, 'Min 8 characters' ),
        age: yup.number().required( 'Age is required' ).min( 13, 'Must be 13+' ).max( 120, 'Invalid age' ),
        birthdate: yup.date().required( 'Birthdate is required' ),
        accountType: yup.string().required( 'Account type is required' ),
        experience: yup.number().required( 'Experience level is required' ),
    } );

    /**
     * FormConfig - Config-driven form definition
     *
     * Demonstrates production pattern: define form structure as JSON config
     * instead of manually coding each field component.
     *
     * Structure:
     * - groups: Array of field groups (each with optional title/subtitle)
     * - fields: Array of field definitions (name, type, label, props, etc.)
     * - validationSchema: Yup schema for validation rules
     * - context: Additional metadata passed to form handlers
     *
     * Field Types Demonstrated:
     * - text, email, password: Standard text inputs with type variants
     * - number: Numeric input with min/max constraints via props
     * - date: Date picker for birthdate
     * - select: Dropdown with value/label options array
     * - slider: Range slider with min/max/step via props
     *
     * This config is passed to BaseFormRenderer which auto-generates
     * the appropriate field components via FormFieldFactory.
     */
    const formConfig: FormConfig = {
        groups: [
            {
                type: 'fields',
                title: 'Account Information',
                subtitle: 'Basic details for your account',
                fields: [
                    {
                        name: 'username',
                        type: 'text',
                        label: { text: 'username' },
                        placeholder: 'Enter your username',
                        required: true,
                    },
                    {
                        name: 'email',
                        type: 'email',
                        placeholder: 'you@example.com',
                        required: true,
                    },
                    {
                        name: 'password',
                        type: 'password',
                        label: { text: 'password', link: 'forgotten your password?', href: '/' },
                        placeholder: 'Enter secure password',
                        required: true,
                    },
                ],
            },
            {
                type: 'fields',
                title: 'Personal Details',
                fields: [
                    {
                        name: 'age',
                        type: 'number',
                        placeholder: 'Your age',
                        required: true,
                        props: { min: 13, max: 120 },
                    },
                    {
                        name: 'birthdate',
                        type: 'date',
                        label: { text: 'Date of Birth' },
                        required: true,
                    },
                    {
                        name: 'accountType',
                        type: 'select',
                        label: { text: 'Account Type' },
                        required: true,
                        options: [
                            { value: 'basic', label: 'Basic (Free)' },
                            { value: 'standard', label: 'Standard ($9.99/mo)' },
                            { value: 'premium', label: 'Premium ($19.99/mo)' },
                        ],
                    },
                    {
                        name: 'experience',
                        type: 'slider',
                        label: { text: 'Experience Level' },
                        required: true,
                        props: { min: 0, max: 10, step: 1, valueLabelDisplay: 'on' },
                    },
                ],
            },
        ],
        validationSchema,
        context: { isCreate: true },
    };

    /**
     * Form submission handler
     *
     * Demonstrates async form handling pattern:
     * 1. Set loading state (disables submit button, shows loading text)
     * 2. Capture form data for display
     * 3. Simulate API call (1.5s timeout)
     * 4. Update success/error states
     * 5. Display result via Feedback slot
     *
     * In production:
     * - Replace setTimeout with actual API call
     * - Handle errors from API (try/catch)
     * - Navigate on success (redirect to dashboard)
     * - Show backend validation errors in Feedback slot
     *
     * @param data - Form data validated against Yup schema
     */
    const handleSubmit = async ( data: any ) =>
    {
        setLoading( true );
        setFormData( data );
        setShowSuccess( false );

        // Simulate API call
        await new Promise( ( resolve ) => setTimeout( resolve, 1500 ) );

        setLoading( false );
        setShowSuccess( true );
        setShowError( false );
    };

    return (
        <Page title="Form Playground" description="Test FormScaffold and BaseFormRenderer">

            <Card sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Form Playground
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom mb={3}>
                    Test FormScaffold slots, BaseFormRenderer, and all form field types with live validation.
                </Typography>
            </Card>

            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>

                    {
                        /**
                        * Controls Panel
                        *
                        * Interactive controls to toggle playground states:
                        * - Show/Hide Error: Toggles FormScaffold.Feedback with severity="error"
                        * - Show/Hide Message: Toggles FormScaffold.Message with custom content
                        * - Form State: Displays current loading/success state
                        * - Submit Data: Shows JSON of last form submission
                        *
                        * Demonstrates:
                        * - How Feedback slot handles errors/warnings/success
                        * - Difference between Feedback (structured alerts) vs Message (custom React)
                        * - Form state visibility for debugging
                        *
                        * Responsive:
                        * - Mobile: Full width, appears above form
                        * - Desktop: Fixed width sidebar, appears to left of form
                        */
                    }
                    <Card>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Controls
                            </Typography>

                            <Stack spacing={2}>
                                <Button
                                    variant={showError ? 'contained' : 'outlined'}
                                    color="error"
                                    onClick={() =>
                                    {
                                        setShowError( !showError );
                                        setShowSuccess( false );
                                    }}
                                    fullWidth
                                >
                                    {showError ? 'Hide' : 'Show'} Error
                                </Button>

                                <Button
                                    variant={showMessage ? 'contained' : 'outlined'}
                                    color="info"
                                    onClick={() => setShowMessage( !showMessage )}
                                    fullWidth
                                >
                                    {showMessage ? 'Hide' : 'Show'} Message
                                </Button>

                                <Button
                                    variant={showMeta ? 'contained' : 'outlined'}
                                    color="secondary"
                                    onClick={() => setShowMeta( !showMeta )}
                                    fullWidth
                                >
                                    {showMeta ? 'Hide' : 'Show'} Meta
                                </Button>

                                <Box sx={{ pt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Form State
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Loading: {loading ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Success: {showSuccess ? 'Yes' : 'No'}
                                    </Typography>
                                </Box>

                                {formData && (
                                    <Box sx={{ pt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Last Submit Data:
                                        </Typography>
                                        <Box
                                            component="pre"
                                            sx={{
                                                fontSize: 10,
                                                bgcolor: 'grey.100',
                                                p: 1,
                                                borderRadius: 1,
                                                overflow: 'auto',
                                                maxHeight: 300,
                                            }}
                                        >
                                            {JSON.stringify( formData, null, 2 )}
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Card>

                    {
                        /**
                            * FormScaffold Demonstration
                            *
                            * Shows all FormScaffold slots in action:
                            *
                            * Slot Order (enforced by FormScaffold):
                            * 1. Header - Title, subtitle, optional action buttons
                            * 2. Feedback - Structured alerts (error/warning/info/success)
                            * 3. Message - Custom React content (banners, promos, etc.)
                            * 4. Meta - Entity-state display (status chips, verification badges)
                            * 5. Body - Form fields (BaseFormRenderer or WizardFormRenderer)
                            * 6. Actions - Submit buttons and form controls
                            * 7. Footer - Links, disclaimers, additional content
                            *
                            * Key Patterns:
                            * - Feedback and Message are separate and can render simultaneously
                            * - Feedback for simple text alerts controlled by severity
                            * - Message for rich React components (promotional banners, etc.)
                            * - Body contains BaseFormRenderer with config-driven fields
                            * - Actions uses form="playground-form" to submit external form
                            *
                            * Responsive:
                            * - Mobile: Full width card
                            * - Desktop: Max 600px width, flex layout
                            */
                    }
                    <Card >
                        <FormScaffold>
                            <FormScaffold.Header
                                title="User Registration"
                                subtitle="Create your account to get started"
                            />

                            {showError && (
                                <FormScaffold.Feedback
                                    message="There was an error processing your request. Please try again."
                                    severity="error"
                                />
                            )}

                            {showSuccess && (
                                <FormScaffold.Feedback
                                    message="Account created successfully! Check your email for verification."
                                    severity="success"
                                />
                            )}

                            {showMessage && (
                                <FormScaffold.Message>
                                    <Box
                                        sx={( theme ) => ( {
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: theme.palette.info.light,
                                            color: theme.palette.info.main,
                                            border: `1px solid ${theme.palette.info.main}`,
                                        } )}
                                    >
                                        <Typography variant="body2">
                                            This is a non-error informational message shown via the{' '}
                                            <code>FormScaffold.Message</code> slot.
                                        </Typography>
                                    </Box>
                                </FormScaffold.Message>
                            )}

                            {showMeta && (
                                <FormScaffold.Meta>
                                    <Stack direction="row" gap={1}>
                                        <Chip label="Verified" size="small" color="success" />
                                        <Chip label="Active" size="small" />
                                    </Stack>
                                </FormScaffold.Meta>
                            )}

                            <FormScaffold.Body>
                                <BaseFormRenderer
                                    config={formConfig}
                                    onSubmit={handleSubmit}
                                    loading={loading}
                                    formId="playground-form"
                                />
                            </FormScaffold.Body>

                            <FormScaffold.Actions>
                                <Button
                                    type="submit"
                                    form="playground-form"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </FormScaffold.Actions>

                            <FormScaffold.Footer>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Already have an account?{' '}
                                    <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                                        Sign In
                                    </Typography>
                                </Typography>
                            </FormScaffold.Footer>
                        </FormScaffold>
                    </Card>
                </Stack>
            </Box>
        </Page>
    );
}