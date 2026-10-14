/**
 * Comments
 *
 * Generic, entity-agnostic comment thread. Comments are polymorphic on the
 * backend, so every domain maps its payload to `CommentEntry` and reuses these.
 */

export { CommentThread } from './CommentThread';
export type { CommentThreadProps } from './CommentThread';
export { CommentItem } from './CommentItem';
export type { CommentItemProps } from './CommentItem';
export { CommentComposer } from './CommentComposer';
export type { CommentComposerProps } from './CommentComposer';
export type { CommentEntry } from './comment.types';
