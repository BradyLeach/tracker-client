import { Controller } from 'react-hook-form';
import { MenuItem, FormHelperText, FormLabel, Select } from '@/components/ui';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedHelp } from '@/components/forms/hooks/useLocalisedHelp';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Interface for a single select option.
 */
interface SelectOption
{
    /** The value for this option (string or number). */
    value: string | number;
    /** The human-readable label to show. */
    label: string;
}

/**
 * Props for the SelectInput component.
 *
 * A schema-driven select (dropdown) field for forms.
 * Integrates with react-hook-form and i18n, and supports full MUI theming.
 */
interface SelectInputProps extends BaseFieldProps
{
    /** Options to display in dropdown. */
    options: SelectOption[];
    /** Optional placeholder; falls back to i18n if omitted. */
    placeholder?: string;
};

/**
 * SelectInput
 *
 * A reusable, schema-driven select/dropdown field for forms.
 * - Handles i18n for labels/placeholders.
 * - Integrates with react-hook-form for validation and error display.
 * - Leverages MUI theming.
 *
 * @param props - Input props, see SelectInputProps interface
 * @returns Rendered select field
 */
export function SelectInput( {
    name,
    control,
    options,
    label,
    placeholder,
    error,
    required,
    fullWidth = true,
    formScope = 'shared',
    hideLabel = false,
    help,
}: SelectInputProps )
{
    // Get localised placeholder
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );
    const fieldHelp = useLocalisedHelp( { name, formScope, help } );

    // Get localised label data (translated strings)
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
                    <Select
                        id={name}
                        fullWidth={fullWidth}
                        error={!!error}
                        displayEmpty
                        {...field}
                    >
                        <MenuItem value="" disabled>{fieldPlaceholder}</MenuItem>
                        {options.map( option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ) )}
                    </Select>
                )}
            />
            {error
                ? (
                    <FormHelperText error>
                        {error.message}
                    </FormHelperText>
                )
                : fieldHelp && <FormHelperText>{fieldHelp}</FormHelperText>}
        </>
    );
}

export default SelectInput;
