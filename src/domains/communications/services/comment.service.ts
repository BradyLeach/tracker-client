import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Comment, CommentEntityType } from '../types/comment.types';

const base = createDomainStore<Comment>( {
    path: 'comments',
    model: 'comment',
    collectionIncludes: ['author'],
    recordIncludes: ['author'],
} );

export const commentService = {
    ...base,

    /**
     * Observes the comments attached to a polymorphic entity.
     *
     * @param entityType - Model type the comments belong to.
     * @param entityId - Identifier of the target entity.
     * @returns Reactive query source for the entity's comments.
     */
    observeByEntity( entityType: CommentEntityType, entityId: string ): DataQuerySource<Comment[]>
    {
        return base.observeWhere(
            { entityType, entityId },
            { entityType, entityId }
        );
    },
};