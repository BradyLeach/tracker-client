/**
 * Tab - App UI component for tab items
 *
 * Thin wrapper over CustomTab (MUI Tab + Modernize theme).
 * Provides stable import surface for tabbed navigation items.
 *
 * @example
 * ```tsx
 * import { Tab } from '@/components/ui/navigation';
 *
 * <Tab label="Overview" value="overview" />
 * ```
 */
import CustomTab from '@/theme/theme-elements/navigation/CustomTab';
import type { TabProps } from '@mui/material';

export function Tab( props: TabProps )
{
    return <CustomTab {...props} />;
}

export default Tab;
