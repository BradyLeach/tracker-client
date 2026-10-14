/**
 * CustomDivider - MUI Divider with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Divider
 * Applies Modernize theme styling via Components.tsx (MuiDivider overrides)
 */
import { Divider, type DividerProps } from '@mui/material';

/**
 * Themed Divider component
 *
 * @param props - MUI Divider props
 * @returns Styled Divider component
 */
const CustomDivider = ( props: DividerProps ) =>
{
    return <Divider {...props} />;
};

export default CustomDivider;
export type { DividerProps };
