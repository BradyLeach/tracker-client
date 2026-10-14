/**
 * CustomAvatar - MUI Avatar with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Avatar
 * Applies Modernize theme styling and customization
 */
import { Avatar, type AvatarProps } from '@mui/material';

/**
 * Themed Avatar component
 *
 * @param props - MUI Avatar props
 * @returns Styled Avatar component
 */
const CustomAvatar = ( props: AvatarProps ) =>
{
    return <Avatar {...props} />;
};

export default CustomAvatar;
export type { AvatarProps };
