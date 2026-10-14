import { Controller } from 'react-hook-form';
import { Box, Stack, FormHelperText, TextField, FormLabel } from '@/components/ui';
import { useRef, useState, type ChangeEvent } from 'react';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the CodeInput field component.
 *
 * Hardcoded for 6-digit numeric verification codes.
 * No customization allowed - enforces consistency across all verification flows.
 */
interface CodeInputProps extends BaseFieldProps
{
    /** Optional placeholder to display; if omitted, falls back to i18n `forms.{formScope}.fields.{name}Placeholder`. */
    placeholder?: string;
}

/**
 * CodeInput
 *
 * A specialized input field for 6-digit verification codes.
 * Uses hidden input + visual character boxes for professional presentation.
 *
 * **Architecture:**
 * - Hidden TextField manages form state and validation
 * - Visual boxes mirror each character for display
 * - Single source of truth (the hidden input)
 *
 * **Hardcoded behaviors (NOT configurable):**
 * - 6-digit maximum length
 * - Numeric-only input (mobile numeric keyboard)
 * - Monospace font for character display
 * - Auto-fill from SMS/email (one-time-code)
 * - Visual feedback per character
 *
 * @param props - Input props, see CodeInputProps interface
 * @returns Rendered code input field with visual boxes
 *
 * @example
 * ```tsx
 * // In form config:
 * {
 *   name: 'code',
 *   type: 'code',
 *   required: true
 * }
 *
 * // Yup validation:
 * yup.string().required().length(6).matches(/^\d{6}$/)
 * ```
 */
export function CodeInput( {
    name,
    control,
    label,
    placeholder,
    error,
    required,
    fullWidth = true,
    formScope = 'shared',
    hideLabel = false,
}: CodeInputProps )
{
    const inputRef = useRef<HTMLInputElement>( null );
    const [isFocused, setIsFocused] = useState( false );

    // Get localised placeholder and label
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    const handleBoxClick = () =>
    {
        inputRef.current?.focus();
    };

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

                    return (
                        <Box sx={{ position: 'relative' }}>
                            {/* Visual display container */}
                            <Box
                                onClick={handleBoxClick}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    cursor: 'text',
                                }}
                            >

                                {/* Character boxes */}
                                <Stack direction="row" spacing={1.5} sx={{ flex: 1, justifyContent: 'center' }}>
                                    {[0, 1, 2, 3, 4, 5].map( ( index ) =>
                                    {
                                        const hasChar = index < value.length;
                                        const isActive = index === value.length && isFocused;

                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: 50,
                                                    height: 55,
                                                    borderRadius: 1.5,
                                                    border: '2px solid',
                                                    borderColor: error
                                                        ? 'error.main'
                                                        : hasChar
                                                            ? 'primary.main'
                                                            : isActive
                                                                ? 'primary.main'
                                                                : 'divider',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.75rem',
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace',
                                                    bgcolor: hasChar ? 'primary.light' : 'background.paper',
                                                    transition: 'all 0.2s',
                                                    ...( isActive && {
                                                        boxShadow: ( theme ) => `0 0 0 2px ${theme.palette.primary.main}33`,
                                                    } ),
                                                }}
                                            >
                                                {value[index] || ''}
                                            </Box>
                                        );
                                    } )}
                                </Stack>
                            </Box>

                            {/* Error message display */}
                            {error?.message && (
                                <FormHelperText error sx={{ mt: 1, mx: 1.75 }}>
                                    {error.message}
                                </FormHelperText>
                            )}

                            {/* Hidden actual input - manages form state */}
                            <TextField
                                {...field}
                                inputRef={inputRef}
                                value={value}
                                onChange={( event: ChangeEvent<HTMLInputElement> ) =>
                                {
                                    // Only allow numeric input
                                    const numericValue = event.target.value.replace( /[^0-9]/g, '' ).slice( 0, 6 );
                                    field.onChange( numericValue );
                                }}
                                id={name}
                                type="text"
                                autoComplete="one-time-code"
                                variant="outlined"
                                fullWidth={fullWidth}
                                placeholder={fieldPlaceholder}
                                error={!!error}
                                onFocus={() => setIsFocused( true )}
                                onBlur={() => setIsFocused( false )}
                                inputProps={{
                                    maxLength: 6,
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                }}
                                sx={{
                                    position: 'absolute',
                                    opacity: 0,
                                    pointerEvents: 'none',
                                }}
                            />
                        </Box>
                    );
                }}
            />
        </>
    );
}

export default CodeInput;