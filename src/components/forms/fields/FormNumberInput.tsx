import { Controller } from 'react-hook-form';
import { InputAdornment, TextField, FormLabel } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for NumberInput field component
 */
interface NumberInputProps extends BaseFieldProps
{
    /** Optional placeholder to display */
    placeholder?: string;
    /** Optional icon to display as start adornment (default is IconAbc). */
    icon?: React.ReactNode;
    /** HTML autocomplete value. */
    autoComplete?: string;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Step increment for number input */
    step?: number;
}

const DEFAULT_ICON = <IconRenderer iconKey="number" size={25} />;

/**
 * NumberInput
 *
 * A reusable number input field for forms with numeric constraints.
 * - Handles i18n for labels and placeholders via hooks
 * - Supports smart labels with embedded links (e.g., Terms & Conditions)
 * - Integrates with react-hook-form for validation
 * - Supports min/max/step constraints
 *
 * **Label Pattern:**
 * Uses SmartLabel component wrapped in CustomFormLabel to support both simple
 * text labels and labels with embedded links.
 *
 * @param props - Input props, see NumberInputProps interface
 * @returns Rendered number field with label, error handling, and icon
 *
 * @see SmartLabel - Renders label content with optional links
 * @see useLocalisedLabel - Translates label config to strings
 * @see useLocalisedPlaceholder - Translates placeholder text
 */
export function NumberInput( {
    name,
    control,
    label,
    placeholder,
    error,
    required,
    icon,
    autoComplete,
    fullWidth = true,
    disabled,
    min,
    max,
    step,
    formScope = 'shared',
    hideLabel = false,
}: NumberInputProps )
{
    // Get localised placeholder
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );

    // Get localised label data (translated strings)
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    const inputIcon = icon || DEFAULT_ICON;

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
                render={( { field } ) =>
                {
                    const value = field.value ?? '';
                    const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) =>
                    {
                        const v = e.target.value;
                        field.onChange( v === '' ? undefined : Number( v ) );
                    };
                    return (
                        <TextField
                            {...field}
                            id={name}
                            type="number"
                            autoComplete={autoComplete || name}
                            variant="outlined"
                            fullWidth={fullWidth}
                            disabled={disabled}
                            placeholder={fieldPlaceholder}
                            error={!!error}
                            helperText={error?.message}
                            value={value}
                            onChange={onChange}
                            inputProps={{ min, max, step, inputMode: 'numeric', pattern: '[0-9]*' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {inputIcon}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    );
                }}
            />
        </>
    );
}

export default NumberInput;
