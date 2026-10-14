/**
 * FormControlLabel - App UI component for labeled form controls
 *
 * Direct wrapper over MUI FormControlLabel (no theme-element exists).
 * Provides stable import surface for all form control label usage across app.
 */
import { FormControlLabel as MuiFormControlLabel, type FormControlLabelProps } from '@mui/material';

export type { FormControlLabelProps } from '@mui/material';

export function FormControlLabel( props: FormControlLabelProps )
{
    return <MuiFormControlLabel {...props} />;
}

export default FormControlLabel;
