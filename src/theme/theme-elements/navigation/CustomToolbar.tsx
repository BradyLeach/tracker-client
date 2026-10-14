
import { Toolbar, type ToolbarProps } from '@mui/material';

/**
 * CustomToolbar - Theme-element wrapper for MUI Toolbar
 *
 * Provides decoupled Toolbar for navbar content layout.
 * Currently a passthrough wrapper - customize here for app-wide Toolbar behavior.
 */
const CustomToolbar = ( props: ToolbarProps ) => <Toolbar {...props} />;

export default CustomToolbar;
