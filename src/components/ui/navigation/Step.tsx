/**
 * Step - App UI component for individual steps
 *
 * Direct wrapper over MUI Step (no theme-element exists).
 * Provides stable import surface for all step usage across app.
 */
import { Step as MuiStep, type StepProps } from '@mui/material';

export type { StepProps } from '@mui/material';

export function Step( props: StepProps )
{
    return <MuiStep {...props} />;
}

export default Step;
