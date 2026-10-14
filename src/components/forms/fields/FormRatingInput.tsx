import { Controller } from 'react-hook-form';
import { Box, Rating } from '@/components/ui';
import { FormLabel } from '@/components/ui/forms/FormLabel';
import { Typography } from '@/components/ui/typography';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';
import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

interface RatingInputProps extends BaseFieldProps
{
    /** Number of stars (default: 5). */
    max?: number;
    /** Minimum increment between values (default: 0.5). */
    precision?: number;
}

export function RatingInput( {
    name,
    control,
    label,
    error,
    required,
    max = 5,
    precision = 0.5,
    fullWidth = true,
    formScope = 'shared',
    hideLabel = false,
    disabled,
}: RatingInputProps )
{
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
                        <Rating
                            {...field}
                            value={field.value ?? null}
                            onChange={( _, value ) => field.onChange( value )}
                            max={max}
                            precision={precision}
                            disabled={disabled}
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

export default RatingInput;
