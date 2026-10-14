/**
 * CommentItem
 *
 * One comment: who, when, what. No actions — editing and deleting are not
 * part of the pattern yet, and a disabled control is worse than none.
 */

import { useTranslation } from 'react-i18next';
import { Avatar, Box, Typography } from '@/components/ui';
import { RichTextContent } from '@/components/shared/richText';
import { formatRelativeTime, getInitials } from '@/core/utils';
import type { CommentEntry } from './comment.types';

export interface CommentItemProps
{
    comment: CommentEntry;
    /** Matches the composer's avatar so the column stays aligned. */
    avatarSize?: number;
}

export function CommentItem( { comment, avatarSize = 32 }: CommentItemProps )
{
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Avatar
                src={comment.authorAvatarUrl}
                sx={{ width: avatarSize, height: avatarSize, fontSize: 13, fontWeight: 600, flexShrink: 0 }}
            >
                {getInitials( comment.authorName )}
            </Avatar>

            {/* minWidth:0 so a long unbroken body wraps rather than widening
                the thread's container. */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'none' }}>
                        {comment.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime( comment.createdAt )}
                    </Typography>
                </Box>

                {/* The body is a stored document. Typography settings live on
                    the wrapper so every element inside inherits them. */}
                <Box sx={{ typography: 'body2', color: 'text.secondary', overflowWrap: 'anywhere' }}>
                    <RichTextContent value={comment.body} errorMessage={t( 'comment.unavailable' )} />
                </Box>
            </Box>
        </Box>
    );
}

export default CommentItem;
