/**
 * Tooltip - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomTooltip, {
    type TooltipProps as CustomTooltipProps,
} from '@/theme/theme-elements/data-display/CustomTooltip';

/**
 * Re-exported TooltipProps for app usage
 */
export type TooltipProps = CustomTooltipProps;

/**
 * Tooltip component for app code
 *
 * @param props - Tooltip props
 * @returns Tooltip component
 */
export function Tooltip( props: TooltipProps )
{
    return <CustomTooltip {...props} />;
}

export default Tooltip;
