
import { AppBar, type AppBarProps } from '@mui/material';

/**
 * CustomAppBar - Theme-element wrapper for MUI AppBar
 *
 * Provides decoupled AppBar for navbar/header layouts.
 * Currently a passthrough wrapper - customize here for app-wide AppBar behavior.
 */
const CustomAppBar = ( props: AppBarProps ) => <AppBar {...props} />;

export default CustomAppBar;
