/**
 * MenuList - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements. The arrow-key list of a menu, for a
 * popover that keeps fixed content above or below the options.
 */
import CustomMenuList, { type MenuListProps as CustomMenuListProps } from '@/theme/theme-elements/navigation/CustomMenuList';

export type MenuListProps = CustomMenuListProps;

export function MenuList( props: MenuListProps )
{
    return <CustomMenuList {...props} />;
}

export default MenuList;
