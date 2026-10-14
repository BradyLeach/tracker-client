/**
 * StepLabel - App UI component for step labels
 *
 * Direct wrapper over MUI StepLabel (no theme-element exists).
 * Provides stable import surface for all step label usage across app.
 */
import { StepLabel as MuiStepLabel, type StepLabelProps } from '@mui/material';

export type { StepLabelProps } from '@mui/material';

export function StepLabel( props: StepLabelProps )
{
    return <MuiStepLabel {...props} />;
}

export default StepLabel;
