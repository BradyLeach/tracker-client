
import { Typography, type TypographyProps } from '@mui/material';

/**
 * CustomTypography - Theme-element wrapper for MUI Typography
 *
 * Provides decoupled Typography primitive for text rendering.
 * Currently a passthrough wrapper - customize here for app-wide Typography behavior.
 */
const CustomTypography = ( props: TypographyProps ) => <Typography {...props} />;

export default CustomTypography;
