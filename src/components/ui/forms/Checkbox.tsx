/**
 * Checkbox - App UI component for checkbox inputs
 *
 * Thin wrapper over CustomCheckbox (MUI Checkbox + Modernize theme).
 * Provides stable import surface for all checkbox usage across app.
 */
import CustomCheckbox from '@/theme/theme-elements/forms/CustomCheckbox';
import type { CheckboxProps } from '@mui/material';

export type { CheckboxProps } from '@mui/material';

export function Checkbox( props: CheckboxProps )
{
    return <CustomCheckbox {...props} />;
}

export default Checkbox;
