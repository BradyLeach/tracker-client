/**
 * CustomMenuList - MUI MenuList with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI MenuList — the keyboard-navigable
 * list a Menu renders, for a surface that needs content beside the list.
 */
import { MenuList, type MenuListProps } from '@mui/material';

const CustomMenuList = ( props: MenuListProps ) => <MenuList {...props} />;

export default CustomMenuList;
export type { MenuListProps };
