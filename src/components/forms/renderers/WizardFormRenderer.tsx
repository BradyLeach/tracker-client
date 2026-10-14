/**
 * Wizard Form Renderer - Multi-step form implementation
 *
 * Provides enterprise-grade wizard form functionality with:
 * - Step-by-step form validation and navigation
 * - Customizable step actions and navigation controls
 * - Integration with react-hook-form and Material-UI components
 * - Support for complex form field types via FormFieldFactory pattern
 *
 * **Pure Renderer:**
 * This component only handles form logic (fields, validation, navigation).
 * Layout concerns (header, footer, actions) are managed by parent components
 * using FormScaffold slots.
 *
 * @example
 * ```tsx
 * const registrationConfig: FormConfig = {
 *   title: 'User Registration',
 *   groups: [
 *     { title: 'Personal Info', fields: [...] },
 *     { title: 'Contact Details', fields: [...] }
 *   ],
 *   footerLink: {
 *     prefaceText: 'pages.registration.alreadyHaveAccount',
 *     linkText: 'shared.buttons.login',
 *     href: '/auth/login'
 *   }
 * };
 *
 * <FormScaffold>
 *   <FormScaffold.Header title={config.title} subtitle={config.subtitle} />
 *   <FormScaffold.Body>
 *     <WizardFormRenderer
 *       config={registrationConfig}
 *       onSubmit={handleRegistration}
 *       loading={isSubmitting}
 *     />
 *   </FormScaffold.Body>
 *   <FormScaffold.Footer>
 *     <FormConfigFooter config={config} />
 *   </FormScaffold.Footer>
 * </FormScaffold>
 * ```
 *
 * @see FormConfigFooter - Reusable footer component for config-driven footers
 * @see FormScaffold - Layout container with slot-based architecture
 */
import React, { useMemo, useState, useEffect } from 'react';
import { FormProvider, type FieldValues, type Path } from 'react-hook-form';
import { Box, Typography, Stack, Button, Stepper, Step, StepLabel } from '@/components/ui';
import type { FormConfig, FieldGroupConfig } from '@/components/forms/types/formConfig.types';
import { FieldGroupRenderer } from './FieldGroupRenderer';
import { useFormConfig } from '../hooks/useFormConfig';
import { useTranslation } from 'react-i18next';

/**
 * Props for the WizardFormRenderer component
 *
 * @template TData - The type of form data being collected
 */
export interface WizardFormRendererProps<TData extends FieldValues = FieldValues>
{
    /** Form configuration object defining steps, fields, and validation */
    config: FormConfig;
    /** Handler called when the final form submission occurs */
    onSubmit: ( data: TData ) => Promise<void> | void;
    /** Loading state to disable form interactions during submission */
    loading?: boolean;
    /** Error message to display below the form */
    error?: string;
    /** Form scope for i18n keys (e.g., 'login', 'registration'). Falls back to 'shared' if not provided. */
    formScope?: string;
    /** Custom step action renderer for advanced navigation control */
    renderStepActions?: ( args: {
        /** Current step index (0-based) */
        stepIndex: number;
        /** Whether this is the final step */
        isLast: boolean;
        /** Form loading state */
        loading?: boolean;
        /** Handler to navigate to previous step */
        onBack: () => void;
        /** Handler to navigate to next step or submit */
        onNext: () => void;
        /** Handler to submit the form directly */
        onSubmit: () => void;
    } ) => React.ReactNode;
}

/**
 * Multi-step wizard form renderer with validation and navigation
 *
 * Renders a form configuration as a stepped wizard interface, handling validation
 * per step and providing smooth navigation between form sections.
 *
 * @template TData - The form data type
 * @param props - WizardFormRendererProps configuration
 * @returns JSX element containing the complete wizard form
 */
export const WizardFormRenderer = <TData extends FieldValues = FieldValues>( {
    config,
    onSubmit,
    loading,
    error,
    formScope = 'shared',
    renderStepActions,
}: WizardFormRendererProps<TData> ) =>
{
    const methods = useFormConfig<TData>( config );

    const [active, setActive] = useState( 0 );
    const steps = config.groups.filter( ( g ): g is FieldGroupConfig => g.type === 'fields' );
    const isLast = active === steps.length - 1;
    const { t } = useTranslation();

    /**
     * Focus the first field in the current step after navigation.
     * Uses direct DOM focus since react-hook-form's setFocus can be unreliable with conditional rendering.
     */
    const focusFirstField = () =>
    {
        const firstFieldName = steps[active]?.fields[0]?.name;
        if( !firstFieldName ) return;

        // Wait for React to render the new step, then focus
        requestAnimationFrame( () =>
        {
            setTimeout( () =>
            {
                const element = document.getElementById( firstFieldName );
                element?.focus();
            }, 50 );
        } );
    };

    const currentFieldNames = useMemo<Path<TData>[]>( () =>
    {
        const names = steps[active]?.fields.map( f => f.name ) ?? [];
         
        return names.map( n => n as any );
    }, [steps, active] );

    /**
     * Handles navigation to next step or form submission
     * Validates current step fields before proceeding
     */
    const handleNext = async () =>
    {
        // validate only current group's fields
        const ok = await methods.trigger( currentFieldNames, { shouldFocus: true } );

        if( !ok ) return;

        if( isLast )
        {
            await methods.handleSubmit( onSubmit )();
        }
        else
        {
            setActive( s => s + 1 );
        }
    };

    /** Handles navigation to previous step */
    const handleBack = () => setActive( s => Math.max( 0, s - 1 ) );

    // Focus first field on mount and when step changes
    useEffect( () =>
    {
        focusFirstField();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active] );

    return (
        <FormProvider<TData> {...methods}>
            <Box component="form" onSubmit={methods.handleSubmit( onSubmit )} noValidate>
                {/* Use Modernize Stepper (works with plain MUI Stepper API) */}
                <Stepper activeStep={active} sx={{ mb: 3 }}>
                    {steps.map( ( g, i ) => (
                        <Step key={i}>
                            <StepLabel>{t( g.title ? g.title : `Step ${i + 1}` )}</StepLabel>
                        </Step>
                    ) )}
                </Stepper>

                {/* Current group */}
                <Stack mb={2}>
                    {steps[active]?.title && (
                        <Typography variant="h5" fontWeight={600}>
                            {t( steps[active].title )}
                        </Typography>
                    )}
                    {steps[active]?.subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {t( steps[active].subtitle )}
                        </Typography>
                    )}
                    <FieldGroupRenderer fields={steps[active]?.fields ?? []} loading={loading} formScope={formScope} />
                </Stack>

                {/* Error */}
                {error && (
                    <Box mt={2}>
                        <Typography color="error" variant="body2">{error}</Typography>
                    </Box>
                )}

                {/* Actions */}
                {renderStepActions ? (
                    renderStepActions( {
                        stepIndex: active,
                        isLast,
                        loading,
                        onBack: handleBack,
                        onNext: handleNext,
                        onSubmit: () => methods.handleSubmit( onSubmit )(),
                    } )
                ) : (
                    <>
                        <Stack direction="row" spacing={2} justifyContent="space-between" mt={2}>
                            <Button onClick={handleBack} disabled={active === 0 || loading}>
                                {t( 'shared.buttons.back' )}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={loading}
                                type={'button'}
                            >
                                {isLast ? t( 'shared.buttons.submit' ) : t( 'shared.buttons.next' )}
                            </Button>
                        </Stack>
                    </>
                )}
            </Box>
        </FormProvider>
    );
};
