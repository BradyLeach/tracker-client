import { useDataMutation } from '@/services/domain/useDataQuery';
import { commentService } from '../services/comment.service';
import type { Comment, CreateCommentPayload } from '../types/comment.types';

/**
 * Creates a comment and stores the returned record in the domain store.
 *
 * @returns Comment creation mutation state.
 */
export function useCreateComment()
{
    return useDataMutation<Comment, CreateCommentPayload>( async ( data ) =>
    {
        const response = await commentService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}