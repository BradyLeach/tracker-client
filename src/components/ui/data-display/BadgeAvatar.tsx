/**
 * BadgeAvatar - Avatar with optional badge overlay
 *
 * Generic avatar component that supports optional badge content.
 * Agnostic to badge meaning - can represent notifications, levels, status, achievements, etc.
 *
 * Use cases:
 * - Notification count (unread messages, alerts)
 * - User level/rank in gamification
 * - Online/offline status indicator
 * - Achievement badges
 * - Any other contextual badge overlay
 *
 * @example
 * ```tsx
 * // Notification count
 * <BadgeAvatar
 *   avatarProps={{ src: '/user.jpg', alt: 'User' }}
 *   badgeProps={{ badgeContent: 5, color: 'error' }}
 * />
 *
 * // Level badge
 * <BadgeAvatar
 *   avatarProps={{ src: '/user.jpg', alt: 'User' }}
 *   badgeProps={{ badgeContent: 'L12', color: 'primary' }}
 * />
 *
 * // Status indicator
 * <BadgeAvatar
 *   avatarProps={{ src: '/user.jpg', alt: 'User' }}
 *   badgeProps={{ variant: 'dot', color: 'success' }}
 * />
 * ```
 */
import Avatar, { type AvatarProps } from './Avatar';
import Badge, { type BadgeProps } from './Badge';

/**
 * Props for BadgeAvatar
 */
export interface BadgeAvatarProps
{
    /** Avatar configuration (src, alt, size, etc.) */
    avatarProps: AvatarProps;
    /** Optional badge configuration (content, color, position, etc.) */
    badgeProps?: BadgeProps;
}

/**
 * BadgeAvatar component
 *
 * Renders an avatar with an optional badge overlay.
 * If badgeProps is undefined, renders avatar without badge.
 *
 * @param props - Component props
 * @returns Avatar with optional badge
 */
export function BadgeAvatar( { avatarProps, badgeProps }: BadgeAvatarProps )
{
    return badgeProps ? (
        <Badge {...badgeProps}>
            <Avatar {...avatarProps} />
        </Badge>
    ) : (
        <Avatar {...avatarProps} />
    );
}

export default BadgeAvatar;
