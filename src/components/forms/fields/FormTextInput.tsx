import { Controller } from 'react-hook-form';
import { InputAdornment, TextField, FormLabel } from '@/components/ui';
import type { IconKey } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { useLocalisedPlaceholder } from '@/components/forms/hooks/useLocalisedPlaceholder';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the TextInput field component.
 *
 * Used with react-hook-form Controller for consistent schema-driven form rendering.
 */
interface TextInputProps extends BaseFieldProps
{
    /** The type of input, text, password, email etc, also used to select default icon. */
    type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'url';
    /** Optional placeholder to display; if omitted, falls back to i18n `forms.{formScope}.fields.{name}Placeholder`. */
    placeholder?: string;
    /** Optional icon to display as start adornment (default is IconAbc). */
    icon?: React.ReactNode;
    /** HTML autocomplete value. */
    autoComplete?: string;
    /** Render as a multi-line text area — for prose such as a hypothesis or a learning. */
    multiline?: boolean;
    /** Minimum visible rows when multiline. */
    minRows?: number;
};

/**
 * Maps common input types or field names to default icon keys.
 *
 * Used by the TextInput component to provide consistent iconography
 * without requiring each form or config to specify icons explicitly.
 * Falls back to 'text' icon if no match is found.
 */
const TYPE_ICON_MAP: Record<string, { key: IconKey; size: number }> = {
    email: { key: 'mail', size: 18 },
    password: { key: 'lock', size: 18 },
    text: { key: 'text', size: 25 },
    url: { key: 'link', size: 25 },
    search: { key: 'search', size: 25 },
    number: { key: 'number', size: 25 },
    default: { key: 'text', size: 25 },
};

/**
 * TextInput
 *
 * A reusable, schema-driven text input field for forms.
 * - Handles i18n for labels and placeholders via hooks
 * - Supports smart labels with embedded links (e.g., Terms & Conditions)
 * - Integrates with react-hook-form for validation and error display
 * - Leverages MUI theming and consistent icon adornment
 *
 * **Label Pattern:**
 * Uses SmartLabel component wrapped in CustomFormLabel to support both simple
 * text labels and labels with embedded links.
 *
 * @param props - Input props, see TextInputProps interface
 * @returns Rendered text field with label, error handling, and icon
 *
 * @see SmartLabel - Renders label content with optional links
 * @see useLocalisedLabel - Translates label config to strings
 * @see useLocalisedPlaceholder - Translates placeholder text
 */
export function TextInput( {
    name,
    control,
    label,
    placeholder,
    error,
    required,
    icon,
    autoComplete,
    multiline = false,
    minRows,
    fullWidth = true,
    type = 'text',
    formScope = 'shared',
    hideLabel = false,
}: TextInputProps )
{
    // Get localised placeholder
    const fieldPlaceholder = useLocalisedPlaceholder( { name, formScope, placeholder } );

    // Get localised label data (translated strings)
    const fieldLabel = useLocalisedLabel( { name, formScope, label } );

    // Select the correct icon for the type.
    const iconConfig = TYPE_ICON_MAP[type] || TYPE_ICON_MAP.default;

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
                    <TextField
                        {...field}
                        value={field.value ?? ''}
                        id={name}
                        type={type}
                        multiline={multiline}
                        minRows={minRows}
                        autoComplete={autoComplete || name}
                        variant="outlined"
                        fullWidth={fullWidth}
                        placeholder={fieldPlaceholder}
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {icon || <IconRenderer iconKey={iconConfig.key} size={iconConfig.size} />}
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />
        </>
    );
}

export default TextInput;
