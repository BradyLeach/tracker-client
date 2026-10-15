import { useDataMutation } from '@/services/domain/useDataQuery';
import { channelIdeaService } from '../services/channelIdea.service';
import type { ChannelIdea } from '../types/channelIdea.types';

export function useUpdateChannelIdea( id: string )
{
    return useDataMutation<ChannelIdea, Partial<ChannelIdea>>( async ( data ) =>
    {
        const response = await channelIdeaService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
