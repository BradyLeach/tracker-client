
import { Tabs, type TabsProps } from '@mui/material';

/**
 * CustomTabs - Theme-element wrapper for MUI Tabs
 *
 * Provides decoupled Tabs container for tabbed navigation.
 * Currently a passthrough wrapper - customize here for app-wide Tabs behavior.
 */
const CustomTabs = ( props: TabsProps ) => <Tabs {...props} />;

export default CustomTabs;
