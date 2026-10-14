/**
 * FormHelperText - App UI component for input helper/error messages
 *
 * Thin wrapper over CustomFormHelperText (MUI FormHelperText + Modernize theme).
 * Provides stable import surface for form field hints and validation messages.
 *
 * @example
 * ```tsx
 * import { FormHelperText } from '@/components/ui/inputs';
 *
 * <FormHelperText error>This field is required</FormHelperText>
 * ```
 */
import CustomFormHelperText from '@/theme/theme-elements/forms/CustomFormHelperText';
import type { FormHelperTextProps } from '@mui/material';

export function FormHelperText( props: FormHelperTextProps )
{
    return <CustomFormHelperText {...props} />;
}

export default FormHelperText;
