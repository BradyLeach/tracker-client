
import { Paper, type PaperProps } from '@mui/material';

/**
 * CustomPaper - Theme-element wrapper for MUI Paper
 *
 * Provides decoupled Paper primitive for surfaces.
 * Currently a passthrough wrapper - customize here for app-wide Paper behavior.
 */
const CustomPaper = ( props: PaperProps ) => <Paper {...props} />;

export default CustomPaper;
