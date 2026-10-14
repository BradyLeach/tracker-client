
import { MenuItem, type MenuItemProps } from '@mui/material';

/**
 * CustomMenuItem - Theme-element wrapper for MUI MenuItem
 *
 * Provides decoupled MenuItem for dropdown/menu items.
 * Currently a passthrough wrapper - customize here for app-wide MenuItem behavior.
 */
const CustomMenuItem = ( props: MenuItemProps ) => <MenuItem {...props} />;

export default CustomMenuItem;
