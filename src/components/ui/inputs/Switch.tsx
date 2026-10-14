/**
 * Switch - App UI component for toggling
 *
 * Thin wrapper over CustomSwitch (MUI Switch + Modernize theme).
 * Provides stable import surface for app-wide Switch usage.
 */
import CustomSwitch from '@/theme/theme-elements/forms/CustomSwitch';
import type { SwitchProps } from '@mui/material';

export function Switch( props: SwitchProps )
{
    return <CustomSwitch {...props} />;
}

export default Switch;
