import { useDataQuery } from '@/services/domain/useDataQuery';
import { commentService } from '../services/comment.service';
import type { Comment, CommentEntityType } from '../types/comment.types';

/**
 * Observes comments attached to a polymorphic entity.
 *
 * @param entityType - Model type the comments belong to.
 * @param entityId - Identifier of the target entity.
 * @returns Reactive comment query state.
 */
export function useComments( entityType: CommentEntityType, entityId: string | undefined )
{
    return useDataQuery<Comment[]>(
        () => entityId ? commentService.observeByEntity( entityType, entityId ) : undefined,
        [entityType, entityId]
    );
}