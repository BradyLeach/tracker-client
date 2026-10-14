/**
 * Tabs - App UI component for tab containers
 *
 * Thin wrapper over CustomTabs (MUI Tabs + Modernize theme).
 * Provides stable import surface for tabbed navigation containers.
 *
 * @example
 * ```tsx
 * import { Tabs } from '@/components/ui/navigation';
 *
 * <Tabs value={activeTab} onChange={handleChange}>
 *   <Tab label="Tab 1" />
 *   <Tab label="Tab 2" />
 * </Tabs>
 * ```
 */
import CustomTabs from '@/theme/theme-elements/navigation/CustomTabs';
import type { TabsProps } from '@mui/material';

export function Tabs( props: TabsProps )
{
    return <CustomTabs {...props} />;
}

export default Tabs;
