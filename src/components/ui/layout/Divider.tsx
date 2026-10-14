/**
 * Divider - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomDivider, {
    type DividerProps as CustomDividerProps,
} from '@/theme/theme-elements/layout/CustomDivider';

/**
 * Re-exported DividerProps for app usage
 */
export type DividerProps = CustomDividerProps;

/**
 * Divider component for app code
 *
 * @param props - Divider props
 * @returns Divider component
 */
export function Divider( props: DividerProps )
{
    return <CustomDivider {...props} />;
}

export default Divider;
