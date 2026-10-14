/**
 * CustomDrawer - MUI Drawer wrapper with Modernize theme
 *
 * Passthrough wrapper for MUI Drawer component.
 * Theme styling applied via Components.tsx overrides.
 */
import { Drawer, type DrawerProps } from '@mui/material';

const CustomDrawer = ( props: DrawerProps ) =>
{
    return <Drawer {...props} />;
};

export default CustomDrawer;
export type { DrawerProps };
