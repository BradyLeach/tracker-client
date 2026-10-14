import { useForm, type FieldValues, type DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { FormConfig } from '@/components/forms/types/formConfig.types';
import { extractDefaultValues } from '../utils/formUtils';

/**
 * Custom hook to initialize react-hook-form with FormConfig settings.
 * Centralizes form initialization logic for all form renderers.
 *
 * @template TData - Shape of form values; must extend react-hook-form `FieldValues`.
 * @param config - FormConfig with fields, validation schema, context, and default values.
 * @returns Configured useForm instance ready for FormProvider.
 *
 * @example
 * ```tsx
 * const methods = useFormConfig<LoginFields>(config);
 * return (
 *   <FormProvider {...methods}>
 *     <form onSubmit={methods.handleSubmit(onSubmit)}>
 *       ...
 *     </form>
 *   </FormProvider>
 * );
 * ```
 */
export function useFormConfig<TData extends FieldValues = FieldValues>( config: FormConfig )
{
    return useForm<TData>( {
        resolver: config.validationSchema ? yupResolver( config.validationSchema ) : undefined,
        mode: 'onBlur',
        context: config.context,
        defaultValues: extractDefaultValues( config ) as DefaultValues<TData>,
    } );
}
