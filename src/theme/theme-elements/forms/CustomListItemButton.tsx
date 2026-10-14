
import { ListItemButton, type ListItemButtonProps } from '@mui/material';

/**
 * CustomListItemButton - Theme-element wrapper for MUI ListItemButton
 *
 * Provides decoupled ListItemButton primitive for list items.
 * Currently a passthrough wrapper - customize here for app-wide ListItemButton behavior.
 */
const CustomListItemButton = ( props: ListItemButtonProps ) => <ListItemButton {...props} />;

export default CustomListItemButton;
