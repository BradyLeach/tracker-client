/**
 * Channel Idea Sub-Domain — Public API
 *
 * Stable import surface for the channel idea sub-domain.
 * Import from here, never from internal paths.
 */

export type { ChannelIdea, BullseyeRing } from './types/channelIdea.types';
export { channelIdeaService } from './services/channelIdea.service';
export { useChannelIdeas } from './hooks/useChannelIdeas';
export { useChannelIdea } from './hooks/useChannelIdea';
export { useCreateChannelIdea } from './hooks/useCreateChannelIdea';
export { useUpdateChannelIdea } from './hooks/useUpdateChannelIdea';
export { useDeleteChannelIdea } from './hooks/useDeleteChannelIdea';
