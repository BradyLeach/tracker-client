/**
 * CommentThread
 *
 * Composer plus a bounded list of comments, newest first.
 *
 * Bounded on purpose: a busy record must not make the page around it longer.
 * The list is a paged collection like any other, so a long history is reached
 * by paging this container rather than scrolling the profile.
 *
 * Ordering is owned here rather than trusted from the caller — comments are
 * polymorphic and every source orders by timestamp, so the thread applies it
 * once instead of each domain remembering to.
 *
 * @example
 * ```tsx
 * <CommentThread
 *     comments={comments}
 *     onSubmit={body => addComment({ entityId, body })}
 * />
 * ```
 */

import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@/components/ui';
import { CollectionPagination } from '@/components/collection';
import { useCollection, type SortValue } from '@/core/collection';
import { timestampOf } from '@/core/utils';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import type { CommentEntry } from './comment.types';

export interface CommentThreadProps
{
    comments: readonly CommentEntry[];
    onSubmit: ( body: string ) => void | Promise<void>;
    isSubmitting?: boolean;
    /** Comments per page. */
    pageSize?: number;
    /** Hide the composer where the user may read but not comment. */
    readOnly?: boolean;
    /**
     * For a thread in a bounded section: the composer stays one line until it is
     * used, so the comments keep the height rather than the input.
     */
    compact?: boolean;
}

/** Newest first — the pipeline sorts ascending, so negate. */
const NEWEST_FIRST: Record<string, SortValue<CommentEntry>> = {
    createdAt: comment => -timestampOf( comment.createdAt ),
};

export function CommentThread( {
    comments,
    onSubmit,
    isSubmitting = false,
    pageSize = 5,
    readOnly = false,
    compact = false,
}: CommentThreadProps )
{
    const { t } = useTranslation();

    const collection = useCollection( comments, {
        sortValues: NEWEST_FIRST,
        pageSize,
        initialState: { sort: { key: 'createdAt', direction: 'asc' } },
    } );

    return (
        // Fills the height it is given: the composer and the page control stay
        // put, and only the comments move. Without this a thread beside a fixed
        // -height section ends at a different point on the row.
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {!readOnly && (
                <CommentComposer
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    compact={compact}
                />
            )}

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {collection.totalCount === 0
                    ? (
                        <Typography variant="body2" color="text.secondary">
                            {t( 'comment.empty' )}
                        </Typography>
                    )
                    : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {collection.visibleRows.map( comment => (
                                <CommentItem key={comment.id} comment={comment} />
                            ) )}
                        </Box>
                    )
                }
            </Box>

            <CollectionPagination
                page={collection.page}
                pageCount={collection.pageCount}
                totalCount={collection.totalCount}
                pageSize={collection.pageSize}
                onPageChange={collection.setPage}
                alwaysShowSummary={false}
            />
        </Box>
    );
}

export default CommentThread;
