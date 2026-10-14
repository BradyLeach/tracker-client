/**
 * CustomIconButton - MUI IconButton with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI IconButton
 * Applies Modernize theme styling via Components.tsx (MuiIconButton overrides)
 */
import { IconButton, type IconButtonProps } from '@mui/material';

/**
 * Themed IconButton component
 *
 * @param props - MUI IconButton props
 * @returns Styled IconButton component
 */
const CustomIconButton = ( props: IconButtonProps ) =>
{
    return <IconButton {...props} />;
};

export default CustomIconButton;
export type { IconButtonProps };
