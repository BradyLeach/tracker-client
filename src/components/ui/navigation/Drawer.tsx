/**
 * Drawer - App UI wrapper for Drawer component
 *
 * Re-exports CustomDrawer from theme-elements for app usage.
 * Provides stable import surface following 3-layer architecture.
 */
import CustomDrawer, {
    type DrawerProps as CustomDrawerProps,
} from '@/theme/theme-elements/navigation/CustomDrawer';

/**
 * Re-exported DrawerProps for app usage
 */
export type DrawerProps = CustomDrawerProps;

/**
 * Drawer component for app code
 * Used for mobile navigation menus, side panels, etc.
 *
 * @example
 * ```tsx
 * <Drawer open={open} onClose={handleClose} anchor="left">
 *   <List>
 *     <ListItem>Item 1</ListItem>
 *     <ListItem>Item 2</ListItem>
 *   </List>
 * </Drawer>
 * ```
 */
export function Drawer( props: DrawerProps )
{
    return <CustomDrawer {...props} />;
}

export default Drawer;
