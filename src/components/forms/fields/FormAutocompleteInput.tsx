import { Controller } from 'react-hook-form';
import { FormLabel, Autocomplete, type AutocompleteOption } from '@/components/ui';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the AutocompleteInput field component.
 */
interface AutocompleteInputProps extends BaseFieldProps
{
    /** Options to display in the dropdown. */
    options: AutocompleteOption[];
    /** Allow arbitrary user-typed values. Default false (constrained to options list). */
    freeSolo?: boolean;
    /** Optional placeholder; falls back to i18n if omitted. */
    placeholder?: string;
    /** Fires on every keystroke — use for search-as-you-type service calls. */
    onInputChange?: ( value: string ) => void;
    /** Show loading spinner in dropdown (use while fetching async options). */
    loading?: boolean;
}

/**
 * AutocompleteInput
 *
 * A schema-driven autocomplete field for forms.
 * - freeSolo=true: accepts any user-typed string (e.g. company name)
 * - freeSolo=false: constrained to provided options (e.g. partnership type)
 * - Handles i18n for labels and placeholders via hooks
 * - Integrates with react-hook-form via Controller
 *
 * @param props - Input props, see AutocompleteInputProps interface
 * @returns Rendered autocomplete field with label and error handling
 */
export function AutocompleteInput( {
    name,
    control,
    options,
    label,
    placeholder,
    error,
    required,
    freeSolo = false,
    onInputChange,
    loading,
    fullWidth = true,
    disabled,
    formScope = 'shared',
    hideLabel = false,
}: AutocompleteInputProps )
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
                    <Autocomplete
                        id={name}
                        options={options}
                        value={field.value ?? undefined}
                        onChange={( value ) => field.onChange( value )}
                        onInputChange={onInputChange}
                        freeSolo={freeSolo}
                        loading={loading}
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

export default AutocompleteInput;
