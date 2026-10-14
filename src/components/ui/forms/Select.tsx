/**
 * Select - App UI component for select dropdowns
 *
 * Thin wrapper over CustomSelect (MUI Select + Modernize theme).
 * Provides stable import surface for all select usage across app.
 */
import CustomSelect from '@/theme/theme-elements/forms/CustomSelect';
import type { SelectProps } from '@mui/material';

export type { SelectProps } from '@mui/material';

export function Select( props: SelectProps )
{
    return <CustomSelect {...props} />;
}

export default Select;
