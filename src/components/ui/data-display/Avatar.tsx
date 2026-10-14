/**
 * Avatar - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomAvatar, {
    type AvatarProps as CustomAvatarProps,
} from '@/theme/theme-elements/data-display/CustomAvatar';

/**
 * Re-exported AvatarProps for app usage
 */
export type AvatarProps = CustomAvatarProps;

/**
 * Avatar component for app code
 *
 * @param props - Avatar props
 * @returns Avatar component
 */
export function Avatar( props: AvatarProps )
{
    return <CustomAvatar {...props} />;
}

export default Avatar;
