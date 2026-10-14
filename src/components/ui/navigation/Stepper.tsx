/**
 * Stepper - App UI component for step indicators
 *
 * Direct wrapper over MUI Stepper (no theme-element exists).
 * Provides stable import surface for all stepper usage across app.
 */
import { Stepper as MuiStepper, type StepperProps } from '@mui/material';

export type { StepperProps } from '@mui/material';

export function Stepper( props: StepperProps )
{
    return <MuiStepper {...props} />;
}

export default Stepper;
