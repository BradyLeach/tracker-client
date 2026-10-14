
import { Stack, type StackProps } from '@mui/material';

/**
 * CustomStack - Theme-element wrapper for MUI Stack
 *
 * Provides decoupled Stack primitive for flex layout composition.
 * Currently a passthrough wrapper - customize here for app-wide Stack behavior.
 */
const CustomStack = ( props: StackProps ) => <Stack {...props} />;

export default CustomStack;
