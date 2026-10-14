/**
 * Menu - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomMenu, {
    type MenuProps as CustomMenuProps,
} from '@/theme/theme-elements/navigation/CustomMenu';

/**
 * Re-exported MenuProps for app usage
 */
export type MenuProps = CustomMenuProps;

/**
 * Menu component for app code
 *
 * @param props - Menu props
 * @returns Menu component
 */
export function Menu( props: MenuProps )
{
    return <CustomMenu {...props} />;
}

export default Menu;
