/**
 * Channel Idea Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export type BullseyeRing = 'outer' | 'middle' | 'inner';

export interface ChannelIdea
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    /** Foreign key to the channel catalog. Resolve via typeCatalogue. */
    channelId: string;
    title: string;
    description?: string;
    ring: BullseyeRing;
    createdAt?: string;
    updatedAt?: string;
}
