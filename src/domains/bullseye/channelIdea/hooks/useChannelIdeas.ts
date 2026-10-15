/**
 * useChannelIdeas
 *
 * Every idea on the account's Bullseye board.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { channelIdeaService } from '../services/channelIdea.service';
import type { ChannelIdea } from '../types/channelIdea.types';

export function useChannelIdeas()
{
    return useDataQuery<ChannelIdea[]>( () => channelIdeaService.observeAll(), [] );
}
