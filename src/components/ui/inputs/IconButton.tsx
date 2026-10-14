/**
 * IconButton - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomIconButton, {
    type IconButtonProps as CustomIconButtonProps,
} from '@/theme/theme-elements/inputs/CustomIconButton';

/**
 * Re-exported IconButtonProps for app usage
 */
export type IconButtonProps = CustomIconButtonProps;

/**
 * IconButton component for app code
 *
 * @param props - IconButton props
 * @returns IconButton component
 */
export function IconButton( props: IconButtonProps )
{
    return <CustomIconButton {...props} />;
}

export default IconButton;
