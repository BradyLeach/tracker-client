import { Controller } from 'react-hook-form';
import { Box, Typography, FormLabel, Slider } from '@/components/ui';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the SliderInput component.
 */
interface SliderInputProps extends BaseFieldProps
{
    /** Min value for the slider (default: 0). */
    min?: number;
    /** Max value for the slider (default: 100). */
    max?: number;
    /** Step for the slider (default: 1). */
    step?: number;
    /** Display value labels ("auto", "on", "off"). */
    valueLabelDisplay?: 'auto' | 'on' | 'off';
}

/**
 * SliderInput
 *
 * A reusable slider input field for forms.
 * - Handles i18n for labels
 * - Integrates with react-hook-form for validation
 * - Supports min/max/step configuration
 *
 * @param props - Input props, see SliderInputProps interface
 * @returns Rendered slider field with label and error handling
 */
export function SliderInput( {
    name,
    control,
    label,
    error,
    required,
    min = 0,
    max = 100,
    step = 1,
    valueLabelDisplay = 'auto',
    fullWidth = true,
    formScope = 'shared',
    hideLabel = false,
}: SliderInputProps )
{
    // Get localised label data (translated strings)
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    return (
        <Box width={fullWidth ? '100%' : undefined}>
            {!hideLabel && (
                <FormLabel htmlFor={name} required={required}>
                    <SmartLabel labelData={fieldLabel} />
                </FormLabel>
            )}

            <Controller
                name={name}
                control={control}
                render={( { field, fieldState } ) => (
                    <>
                        <Slider
                            {...field}
                            value={field.value ?? min}
                            onChange={( _, value ) => field.onChange( value )}
                            min={min}
                            max={max}
                            step={step}
                            valueLabelDisplay={valueLabelDisplay}
                        />
                        <Typography variant="caption" color="error">
                            {error?.message || fieldState.error?.message}
                        </Typography>
                    </>
                )}
            />
        </Box>
    );
}

export default SliderInput;
