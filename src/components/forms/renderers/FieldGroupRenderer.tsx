import { useFormContext, type FieldError } from 'react-hook-form';
import { Box } from '@/components/ui';
import {
    CheckboxInput,
    CodeInput,
    TextInput,
    DateInput,
    SelectInput,
    AutocompleteInput,
    TagsInput,
    SliderInput,
    NumberInput,
    RatingInput,
    IconInput,
} from '@/components/forms/fields';
import type { FormFieldConfig } from '@/components/forms/types/formConfig.types';

/**
 * Props for FieldGroupRenderer component.
 *
 * @property fields - Field configs to render in this group.
 * @property loading - Whether to render inputs in a disabled state.
 * @property formScope - Form scope for i18n keys.
 */
export interface FieldGroupRendererProps
{
    fields: FormFieldConfig[];
    loading?: boolean;
    formScope?: string;
}

/**
 * Type guard that narrows an unknown value to `FieldError`.
 *
 * @param err - Unknown error value from react-hook-form.
 * @returns True if `err` is a `FieldError`.
 */
function isFieldError( err: unknown ): err is FieldError
{
    return err != null && typeof err === 'object' && 'type' in ( err as Record<string, unknown> );
}

/**
 * Shared field group renderer component.
 *
 * Renders all fields within a single group using the correct component per field type.
 * Used by both BaseFormRenderer and WizardFormRenderer for consistency.
 *
 * @param props - Component props
 * @returns Fragment containing the group's rendered fields
 */
export function FieldGroupRenderer( { fields, loading, formScope }: FieldGroupRendererProps )
{
    const { control, formState } = useFormContext();

    return (
        <>
            {fields.map( ( field ) =>
            {
                const fieldErr = formState.errors?.[field.name];

                switch ( field.type )
                {
                    case 'text':
                    case 'email':
                    case 'password':
                    case 'url':
                        return (
                            <TextInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                type={field.type}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'code':
                        return (
                            <CodeInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'number':
                        return (
                            <NumberInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'date':
                        return (
                            <DateInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'select':
                        return (
                            <SelectInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                options={field.options || []}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'autocomplete':
                        return (
                            <AutocompleteInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                options={field.options || []}
                                freeSolo={field.freeSolo}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'tags':
                        return (
                            <TagsInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                placeholder={field.placeholder}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'slider':
                        return (
                            <SliderInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'checkbox':
                        return (
                            <CheckboxInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'rating':
                        return (
                            <RatingInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                {...field.props}
                            />
                        );

                    case 'icon':
                        return (
                            <IconInput
                                key={field.name}
                                name={field.name}
                                control={control}
                                label={field.label}
                                error={isFieldError( fieldErr ) ? fieldErr : undefined}
                                required={field.required}
                                disabled={loading}
                                formScope={formScope}
                                hideLabel={field.hideLabel}
                                fallback={field.props?.fallback}
                                {...field.props}
                            />
                        );

                    default:
                        return (
                            <Box key={field.name} color="error.main">
                                Unsupported field type: {field.type}
                            </Box>
                        );
                }
            } )}
        </>
    );
}
