/**
 * CustomBadge - MUI Badge with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Badge
 * Applies Modernize theme styling and customization
 */
import { Badge, type BadgeProps } from '@mui/material';

/**
 * Themed Badge component
 *
 * @param props - MUI Badge props
 * @returns Styled Badge component
 */
const CustomBadge = ( props: BadgeProps ) =>
{
    return <Badge {...props} />;
};

export default CustomBadge;
export type { BadgeProps };
