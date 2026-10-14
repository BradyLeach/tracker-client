/**
 * CustomBadge - MUI Badge with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Badge
 * Applies Modernize theme styling and customization
 */
import { Chip, type ChipProps } from '@mui/material';

/**
 * Themed Chip component
 *
 * @param props - MUI Chip props
 * @returns Styled Badge component
 */
const CustomChip = ( props: ChipProps ) =>
{
    return <Chip {...props} />;
};

export default CustomChip;
export type { ChipProps };
