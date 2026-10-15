import { useDataMutation } from '@/services/domain/useDataQuery';
import { channelIdeaService } from '../services/channelIdea.service';
import type { ChannelIdea } from '../types/channelIdea.types';

/**
 * Creates a channel idea. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateChannelIdea()
{
    return useDataMutation<ChannelIdea, Partial<ChannelIdea>>( async ( data ) =>
    {
        const response = await channelIdeaService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
