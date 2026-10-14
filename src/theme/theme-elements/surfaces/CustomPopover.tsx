/**
 * CustomPopover - MUI Popover with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Popover
 * Currently a passthrough — customise here for app-wide Popover behaviour.
 */
import { Popover, type PopoverProps } from '@mui/material';

/**
 * Themed Popover component
 *
 * @param props - MUI Popover props
 * @returns Styled Popover component
 */
const CustomPopover = ( props: PopoverProps ) =>
{
    return <Popover {...props} />;
};

export default CustomPopover;
export type { PopoverProps };
