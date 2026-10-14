
import { Box, type BoxProps } from '@mui/material';

/**
 * CustomBox - Theme-element wrapper for MUI Box
 *
 * Provides decoupled Box primitive for layout composition.
 * Currently a passthrough wrapper - customize here for app-wide Box behavior.
 */
const CustomBox = ( props: BoxProps ) => <Box {...props} />;

export default CustomBox;
