import { FormProvider, type FieldValues } from 'react-hook-form';
import { Box, Typography } from '@/components/ui';
import { FieldGroupRenderer } from './FieldGroupRenderer';
import { StatusBlock } from '../display/StatusBlock';
import { useFormConfig } from '../hooks/useFormConfig';
import type { FormConfig } from '@/components/forms/types/formConfig.types';
import { useTranslation } from 'react-i18next';

/**
 * Props for the BaseFormRenderer component.
 *
 * @template TData - Shape of the form values; must extend react-hook-form `FieldValues`.
 * @property config - Dynamic form config (groups, fields, validation schema, and optional Yup context).
 * @property onSubmit - Called with validated form data when the form is submitted.
 * @property loading - Disables inputs/actions while true.
 * @property formId - Optional form id for connecting external submit buttons (defaults to 'base-form').
 * @property formScope - Form scope for i18n keys (e.g., 'login', 'registration'). Falls back to 'shared' if not provided.
 * @property groupLayout - Layout mode for form groups. 'stack' (default) renders groups vertically. 'grid' uses container queries for responsive columns (full-width in narrow containers, two columns at 600px+).
 */
export interface BaseFormRendererProps<TData extends FieldValues = FieldValues>
{
    config: FormConfig;
    onSubmit: ( data: TData ) => Promise<void> | void;
    loading?: boolean;
    formId?: string;
    formScope?: string;
    groupLayout?: 'stack' | 'grid';
}

/**
 * Base, config-driven form renderer.
 * Pure form logic - handles field rendering, validation, and submission.
 * Layout concerns (headers, errors, actions) are handled by FormScaffold.
 *
 * @remarks
 * - Provide `config.validationSchema` to enable Yup validation.
 * - Provide `config.context` to pass Yup context (e.g., `{ isCreate: true }`).
 *
 * @template TData - Shape of the form values; must extend `FieldValues`.
 * @param props - {@link BaseFormRendererProps}
 * @returns The rendered form fields only.
 */
export const BaseFormRenderer = <TData extends FieldValues = FieldValues>( {
    config,
    onSubmit,
    loading,
    formId = 'base-form',
    formScope = 'shared',
    groupLayout = 'stack',
}: BaseFormRendererProps<TData> ) =>
{
    const methods = useFormConfig<TData>( config );
    const { t } = useTranslation();

    const isGrid = groupLayout === 'grid';

    const groupItems = config.groups.map( ( group, gi ) => (
        <Box
            key={gi}
            sx={isGrid
                ? { flex: group.type === 'status'
                    ? { '@': '1 1 100%', '@900': '1 1 0' }
                    : { '@': '1 1 100%', '@600': '1 1 0' } }
                : { mb: 4 }
            }
        >
            {group.title && (
                <Typography variant="h6" fontWeight={600} mb={2} color="text.primary">
                    {t( group.title )}
                </Typography>
            )}
            {group.type === 'fields' && (
                <>
                    {group.subtitle && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {t( group.subtitle )}
                        </Typography>
                    )}
                    <FieldGroupRenderer fields={group.fields} loading={loading} formScope={formScope} />
                </>
            )}
            {group.type === 'status' && (
                <StatusBlock items={group.items} />
            )}
        </Box>
    ) );

    return (
        <FormProvider<TData> {...methods}>
            <Box
                component="form"
                id={formId}
                onSubmit={methods.handleSubmit( onSubmit )}
                noValidate
                sx={isGrid
                    ? { display: 'flex', flexWrap: 'wrap', gap: 4, containerType: 'inline-size' }
                    : undefined
                }
            >
                {groupItems}
            </Box>
        </FormProvider>
    );
};
