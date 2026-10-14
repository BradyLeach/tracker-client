
import { Tab, type TabProps } from '@mui/material';

/**
 * CustomTab - Theme-element wrapper for MUI Tab
 *
 * Provides decoupled Tab primitive for tabbed navigation.
 * Currently a passthrough wrapper - customize here for app-wide Tab behavior.
 */
const CustomTab = ( props: TabProps ) => <Tab {...props} />;

export default CustomTab;
