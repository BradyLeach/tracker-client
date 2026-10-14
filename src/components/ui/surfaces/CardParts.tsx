/**
 * Card parts - App UI layer wrappers.
 *
 * Card structure is MUI's own composition: header, content, actions. No slot
 * scaffold sits over it — CardHeader already takes avatar, title, subheader
 * and action.
 */
import {
    CustomCardHeader,
    CustomCardContent,
    CustomCardActions,
    type CardHeaderProps,
    type CardContentProps,
    type CardActionsProps,
} from '@/theme/theme-elements/surfaces';

export type { CardHeaderProps, CardContentProps, CardActionsProps };

export function CardHeader( props: CardHeaderProps )
{
    return <CustomCardHeader {...props} />;
}

export function CardContent( props: CardContentProps )
{
    return <CustomCardContent {...props} />;
}

export function CardActions( props: CardActionsProps )
{
    return <CustomCardActions {...props} />;
}
