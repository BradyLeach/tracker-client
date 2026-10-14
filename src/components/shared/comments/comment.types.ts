/**
 * Comment types
 *
 * A view model, not an API shape. Comments are polymorphic on the backend —
 * anything commentable shares one store — so the thread is told what to draw
 * and never learns what the comment is attached to. Each domain maps its
 * payload to this.
 */

export interface CommentEntry
{
    id: string;
    authorName: string;
    /** Falls back to the author's initials when absent. */
    authorAvatarUrl?: string;
    /** ISO timestamp. Drives both display and ordering. */
    createdAt: string;
    body: string;
}
