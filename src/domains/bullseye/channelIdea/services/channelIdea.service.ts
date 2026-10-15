/**
 * Channel Idea Service
 *
 * The Bullseye board: the account's ideas per traction channel and the ring each sits
 * in. Moving an idea between rings is an update of its ring. Channels themselves are
 * system types, resolved through the type catalogue.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { ChannelIdea } from '../types/channelIdea.types';

const MODEL = 'channelIdea';
const PATH = 'bullseye/ideas';

const base = createDomainStore<ChannelIdea>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const channelIdeaService = {
    ...base,
};
