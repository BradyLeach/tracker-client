/**
 * Chip - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomChip, {
    type ChipProps as CustomChipProps
} from '@/theme/theme-elements/data-display/CustomChip';

/**
 * Re-exported ChipProps for app usage
 */
export type ChipProps = CustomChipProps;

/**
 * Chip component for app code
 *
 * @param props - Chip props
 * @returns Chip component
 */
export function Chip( props: ChipProps )
{
    return <CustomChip {...props} />;
}

export default Chip;
