/**
 * TextField - App UI component for text input fields
 *
 * Thin wrapper over CustomTextField (MUI TextField + Modernize theme).
 * Provides stable import surface for all text field usage across app.
 */
import CustomTextField from '@/theme/theme-elements/forms/CustomTextField';
import type { TextFieldProps } from '@mui/material';

export type { TextFieldProps } from '@mui/material';

export function TextField( props: TextFieldProps )
{
    return <CustomTextField {...props} />;
}

export default TextField;
