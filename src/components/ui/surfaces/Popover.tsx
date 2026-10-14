/**
 * Popover - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomPopover, {
    type PopoverProps as CustomPopoverProps,
} from '@/theme/theme-elements/surfaces/CustomPopover';

/**
 * Re-exported PopoverProps for app usage
 */
export type PopoverProps = CustomPopoverProps;

/**
 * Popover component for app code
 *
 * @param props - Popover props
 * @returns Popover component
 */
export function Popover( props: PopoverProps )
{
    return <CustomPopover {...props} />;
}

export default Popover;
