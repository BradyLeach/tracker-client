
import { List, type ListProps } from '@mui/material';

/**
 * CustomList - Theme-element wrapper for MUI List
 *
 * Provides decoupled List primitive for list containers.
 * Currently a passthrough wrapper - customize here for app-wide List behavior.
 */
const CustomList = ( props: ListProps ) => <List {...props} />;

export default CustomList;
