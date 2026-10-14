/**
 * CustomTooltip - MUI Tooltip with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Tooltip
 * Applies Modernize theme styling via Components.tsx (MuiTooltip overrides)
 */
import { Tooltip, type TooltipProps } from '@mui/material';

/**
 * Themed Tooltip component
 *
 * @param props - MUI Tooltip props
 * @returns Styled Tooltip component
 */
const CustomTooltip = ( props: TooltipProps ) =>
{
    return <Tooltip {...props} />;
};

export default CustomTooltip;
export type { TooltipProps };
