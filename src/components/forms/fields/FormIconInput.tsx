import { Controller } from 'react-hook-form';
import { FormHelperText, FormLabel } from '@/components/ui';
import type { IconKey } from '@/components/ui';
import { IconPicker } from '@/components/shared/iconPicker';
import { useLocalisedLabel } from '@/components/forms/hooks/useLocalisedLabel';
import { SmartLabel } from './SmartLabel';

import type { BaseFieldProps } from '@/components/forms/types/BaseFieldProps';

/**
 * Props for the IconInput component.
 *
 * A schema-driven icon field for forms. The value is an icon registry key.
 */
interface IconInputProps extends BaseFieldProps
{
    /** The record category's generic icon, shown while the field holds no icon of its own. */
    fallback: IconKey;
}

/**
 * IconInput
 *
 * Connects the IconPicker to react-hook-form. The picker owns presentation and keyboard
 * handling; this adapter supplies the label, the value and the error.
 *
 * @param props - Input props, see IconInputProps interface
 * @returns Rendered icon field
 */
export function IconInput( {
    name,
    control,
    label,
    error,
    required,
    disabled,
    fallback,
    formScope = 'shared',
    hideLabel = false,
}: IconInputProps )
{
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
                    <IconPicker
                        id={name}
                        ref={field.ref}
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        fallback={fallback}
                        disabled={disabled}
                    />
                )}
            />
            {error && (
                <FormHelperText error>
                    {error.message}
                </FormHelperText>
            )}
        </>
    );
}

export default IconInput;
