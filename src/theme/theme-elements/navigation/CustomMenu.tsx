/**
 * CustomMenu - MUI Menu with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Menu
 * Applies Modernize theme styling via Components.tsx (MuiMenu overrides)
 */
import { Menu, type MenuProps } from '@mui/material';

/**
 * Themed Menu component
 *
 * @param props - MUI Menu props
 * @returns Styled Menu component
 */
const CustomMenu = ( props: MenuProps ) =>
{
    return <Menu {...props} />;
};

export default CustomMenu;
export type { MenuProps };
