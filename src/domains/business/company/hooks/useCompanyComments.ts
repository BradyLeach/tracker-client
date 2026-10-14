/**
 * useCompanyComments
 *
 * Adapts polymorphic comment records to the thread's view model and exposes
 * submitting one.
 *
 * A hook rather than logic in a component because the same thread appears in
 * two places — the profile section and the side panel — and the mapping must
 * not be written twice.
 */

import { useMemo } from 'react';
import type { CommentEntry } from '@/components/shared/comments';
import { useComments, useCreateComment } from '@/domains/communications';

export interface UseCompanyCommentsResult
{
    entries: CommentEntry[];
    isSubmitting: boolean;
    submit: ( body: string ) => Promise<void>;
}

export function useCompanyComments( companyId: string ): UseCompanyCommentsResult
{
    const { data: comments = [] } = useComments( 'company', companyId );
    const createComment = useCreateComment();

    const entries: CommentEntry[] = useMemo(
        () => comments.map( comment => ( {
            id: comment.id,
            // A profile has no name fields — `handle` is the display identity.
            authorName: comment.author?.handle ?? '',
            authorAvatarUrl: comment.author?.avatarURL,
            createdAt: comment.createdAt,
            body: comment.body,
        } ) ),
        [comments],
    );

    return {
        entries,
        isSubmitting: createComment.isPending,
        // The backend derives author and owner from the token; sending them is
        // both unnecessary and rejected.
        submit: async body =>
        {
            await createComment.mutateAsync( { entityType: 'company', entityId: companyId, body } );
        },
    };
}
