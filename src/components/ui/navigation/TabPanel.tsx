/**
 * TabPanel - App UI component for tab content panels
 *
 * Thin wrapper over CustomTabPanel (theme-elements layer).
 * Provides stable import surface for tab content panels.
 *
 * @example
 * ```tsx
 * import { Tabs, Tab, TabPanel } from '@/components/ui';
 *
 * <Tabs value={activeTab} onChange={handleChange}>
 *   <Tab label="Account" />
 *   <Tab label="Security" />
 * </Tabs>
 * <TabPanel value={activeTab} index={0}>Account content</TabPanel>
 * <TabPanel value={activeTab} index={1}>Security content</TabPanel>
 * ```
 */
import CustomTabPanel from '@/theme/theme-elements/navigation/CustomTabPanel';
import type { CustomTabPanelProps } from '@/theme/theme-elements/navigation/CustomTabPanel';

export type TabPanelProps = CustomTabPanelProps;

export function TabPanel( props: TabPanelProps )
{
    return <CustomTabPanel {...props} />;
}

export default TabPanel;
