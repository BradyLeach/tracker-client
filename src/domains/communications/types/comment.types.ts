import type { Profile } from '@/domains/account/profile/types/profile.types';

/**
 * Comment Types
 *
 * Comments are polymorphic on the backend: one store, keyed by what the
 * comment is attached to. Nothing here is company-specific.
 */

/** What a comment can be attached to. Extend as domains gain comments. */
export type CommentEntityType = 'company';

export interface Comment
{
    id: string;
    /** Owning account. */
    ownerId?: string;

    entityType: CommentEntityType;
    /** Polymorphic reference — no foreign key on the backend. */
    entityId: string;

    body: string;

    authorId?: string;
    /**
     * Hydrated by the `author` include — the writer's profile. A profile
     * carries `handle` and `avatarURL`; there are no name fields on it.
     */
    author?: Profile;

    createdAt: string;
    updatedAt?: string;
}

/**
 * Payload for creating a comment.
 *
 * Neither `ownerId` nor `authorId` is sent: the backend derives both from the
 * actor's token, so a client cannot post as another profile or into another
 * account. Only the three facts the client actually knows go over the wire.
 */
export interface CreateCommentPayload
{
    entityType: CommentEntityType;
    entityId: string;
    body: string;
}
