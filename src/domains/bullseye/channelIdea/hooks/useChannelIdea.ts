/**
 * useChannelIdea
 *
 * One channel idea by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { channelIdeaService } from '../services/channelIdea.service';
import type { ChannelIdea } from '../types/channelIdea.types';

export function useChannelIdea( id: string | null )
{
    return useDataQuery<ChannelIdea | undefined>(
        () => id ? channelIdeaService.observeById( id ) : undefined,
        [id],
    );
}
