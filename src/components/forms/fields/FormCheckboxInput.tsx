import { Controller } from 'react-hook-form';
import { FormControlLabel, FormHelperText, Box, Checkbox } from '@/components/ui';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the CheckboxInput field component.
 *
 * Used with react-hook-form Controller for consistent schema-driven form rendering.
 */
interface CheckboxInputProps extends BaseFieldProps
{
    /** Checkbox color variant (default: 'primary'). */
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
}

/**
 * CheckboxInput
 *
 * A reusable, schema-driven checkbox field for forms.
 * - Handles i18n for labels via hooks
 * - Supports smart labels with embedded links (e.g., Terms & Conditions)
 * - Integrates with react-hook-form for validation and error display
 * - Leverages MUI theming and consistent styling
 *
 * **Label Pattern:**
 * Uses SmartLabel component passed to FormControlLabel's label prop.
 * This allows checkboxes to have labels with embedded links.
 *
 * **Why Different from TextInput:**
 * - TextInput: Wraps SmartLabel in CustomFormLabel (separate label element)
 * - CheckboxInput: Passes SmartLabel to FormControlLabel (MUI pattern for wrapped controls)
 *
 * @param props - Input props, see CheckboxInputProps interface
 * @returns Rendered checkbox field with label and error handling
 *
 * @see SmartLabel - Renders label content with optional links
 * @see useLocalisedLabel - Translates label config to strings
 */
export function CheckboxInput( {
    name,
    control,
    label,
    error,
    required,
    disabled,
    formScope = 'shared',
    color = 'primary',
    hideLabel = false,
}: CheckboxInputProps )
{
    // Get localised label data (translated strings)
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    return (
        <Controller
            name={name}
            control={control}
            render={( { field } ) => (
                <Box mt={1}>
                    <FormControlLabel
                        label={hideLabel ? undefined : <SmartLabel labelData={fieldLabel} />}
                        required={hideLabel ? false : required}
                        control={
                            <Checkbox

                                {...field}
                                id={name}
                                checked={field.value || false}
                                onChange={( e ) => field.onChange( e.target.checked )}
                                color={error ? 'error' : color}
                                disabled={disabled}
                            />
                        }
                    />
                    {error && (
                        <FormHelperText error>
                            {error.message}
                        </FormHelperText>
                    )}
                </Box>
            )}
        />
    );
}

export default CheckboxInput;
