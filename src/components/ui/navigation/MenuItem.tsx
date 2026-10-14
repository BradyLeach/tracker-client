/**
 * MenuItem - App UI component for menu/dropdown items
 *
 * Thin wrapper over CustomMenuItem (MUI MenuItem + Modernize theme).
 * Provides stable import surface for dropdown menu items.
 *
 * @example
 * ```tsx
 * import { MenuItem } from '@/components/ui/navigation';
 *
 * <MenuItem onClick={handleClick}>Profile Settings</MenuItem>
 * ```
 */
import CustomMenuItem from '@/theme/theme-elements/navigation/CustomMenuItem';
import type { MenuItemProps } from '@mui/material';
 
export function MenuItem( props: MenuItemProps<any> )
{
    return <CustomMenuItem {...props} />;
}

export default MenuItem;
