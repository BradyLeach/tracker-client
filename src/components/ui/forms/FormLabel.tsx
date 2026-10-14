/**
 * FormLabel - App UI component for form labels
 *
 * Thin wrapper over CustomFormLabel (MUI FormLabel + Modernize theme).
 * Provides stable import surface for all form label usage across app.
 */
import CustomFormLabel from '@/theme/theme-elements/forms/CustomFormLabel';
import type { FormLabelProps } from '@mui/material';

export type { FormLabelProps } from '@mui/material';

export function FormLabel( props: FormLabelProps )
{
    return <CustomFormLabel {...props} />;
}

export default FormLabel;
