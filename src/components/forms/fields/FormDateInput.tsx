import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { InputAdornment, FormLabel, DatePicker } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

import dayjs from 'dayjs';

/**
 * Props for the DateInput component.
 */
interface DateInputProps extends BaseFieldProps
{
    /** Optional placeholder; if omitted, uses i18n `forms.{formScope}.fields.{name}Placeholder`. */
    placeholder?: string;
    /** Icon to use (optional, defaults to calendar). */
    icon?: React.ReactNode;
    /** Output format: 'date-only' emits YYYY-MM-DD (for DOB etc.), 'iso' emits full ISO string (default). */
    outputFormat?: 'date-only' | 'iso';
}

function getErrorMessage( error: unknown ): string | undefined
{
     
    if( error && typeof error === 'object' && 'message' in error && typeof ( error as any ).message === 'string' )
    {
         
        return ( error as any ).message;
    }
    return undefined;
}

/**
 * DateInput
 *
 * A reusable date picker field for forms.
 * - Handles i18n for labels and placeholders
 * - Integrates with react-hook-form for validation
 * - Uses MUI DatePicker with custom click-to-open behavior
 *
 * @param props - Input props, see DateInputProps interface
 * @returns Rendered date picker field with label and error handling
 */
export function DateInput( {
    name,
    control,
    label,
    placeholder,
    error,
    required,
    icon,
    formScope = 'shared',
    hideLabel = false,
    outputFormat = 'iso',
}: DateInputProps )
{
    // Get localised placeholder
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );

    // Get localised label data (translated strings)
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    const [open, setOpen] = useState( false );
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
                render={( { field, fieldState } ) =>
                {
                    // Compute errorMessage here
                    const errorMessage = getErrorMessage( error ) || getErrorMessage( fieldState?.error );

                    return (
                        <DatePicker
                            open={open}
                            onOpen={() => setOpen( true )}
                            onClose={() =>
                            {
                                setOpen( false );
                                field.onBlur(); // Trigger validation on close
                            }}
                            value={field.value ? dayjs( field.value ) : null}
                            onChange={( newValue ) =>
                            {
                                if( !newValue || !newValue.isValid() )
                                {
                                    field.onChange( null );
                                    return;
                                }
                                field.onChange(
                                    outputFormat === 'date-only'
                                        ? newValue.format( 'YYYY-MM-DD' )
                                        : newValue.toISOString()
                                );
                            }}
                            slots={{ openPickerButton: () => null }}
                            slotProps={{
                                textField: {
                                    id: name,
                                    variant: 'outlined',
                                    fullWidth: true,
                                    placeholder: fieldPlaceholder,
                                    error: !!errorMessage,
                                    helperText: errorMessage,
                                    InputProps: {
                                        startAdornment: (
                                            <InputAdornment position="start" onClick={() => setOpen( true )}>
                                                {icon || <IconRenderer iconKey="calendar" />}
                                            </InputAdornment>
                                        ),
                                    },
                                },
                            }}
                        />
                    );
                }}
            />
        </>
    );
}

export default DateInput;
