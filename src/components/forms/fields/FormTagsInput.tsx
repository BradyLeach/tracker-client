import { Controller } from 'react-hook-form';
import { FormLabel, TagsInput as TagsField } from '@/components/ui';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the TagsInput field component.
 */
interface TagsInputProps extends BaseFieldProps
{
    /** Values offered for picking; anything else can still be typed. */
    suggestions?: string[];
    /** Optional placeholder; falls back to i18n if omitted. */
    placeholder?: string;
}

/**
 * TagsInput
 *
 * A schema-driven field for a list of free-text values, entered as chips — an allowed set
 * of names, say. The form value is always a string array.
 * - Handles i18n for labels and placeholders via hooks
 * - Integrates with react-hook-form via Controller
 *
 * @param props - Input props, see TagsInputProps interface
 * @returns Rendered tags field with label and error handling
 */
export function TagsInput( {
    name,
    control,
    suggestions,
    label,
    placeholder,
    error,
    required,
    fullWidth = true,
    disabled,
    formScope = 'shared',
    hideLabel = false,
}: TagsInputProps )
{
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    return (
        <>
            {!hideLabel && (
                <FormLabel htmlFor={name} required={required}>
                    <SmartLabel labelData={fieldLabel} />
                </FormLabel>
            )}

            <Controller
                name={name}
                control={control}
                render={( { field } ) => (
                    <TagsField
                        id={name}
                        value={Array.isArray( field.value ) ? field.value : []}
                        onChange={( value ) => field.onChange( value )}
                        suggestions={suggestions}
                        fullWidth={fullWidth}
                        disabled={disabled}
                        placeholder={fieldPlaceholder}
                        error={!!error}
                        helperText={error?.message}
                    />
                )}
            />
        </>
    );
}

export default TagsInput;
