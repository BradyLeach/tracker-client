/**
 * Badge - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomBadge, {
    type BadgeProps as CustomBadgeProps
} from '@/theme/theme-elements/data-display/CustomBadge';

/**
 * Re-exported BadgeProps for app usage
 */
export type BadgeProps = CustomBadgeProps;

/**
 * Badge component for app code
 *
 * @param props - Badge props
 * @returns Badge component
 */
export function Badge( props: BadgeProps )
{
    return <CustomBadge {...props} />;
}

export default Badge;
