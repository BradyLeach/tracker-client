
import { ListItemText, type ListItemTextProps } from '@mui/material';

/**
 * CustomListItemText - Theme-element wrapper for MUI ListItemText
 *
 * Provides decoupled ListItemText primitive for list item content.
 * Currently a passthrough wrapper - customize here for app-wide ListItemText behavior.
 */
const CustomListItemText = ( props: ListItemTextProps ) => <ListItemText {...props} />;

export default CustomListItemText;
