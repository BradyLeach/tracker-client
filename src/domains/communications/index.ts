// Types
export type { Notification } from './types/notification.types';

// Services
export { notificationService } from './services/notification.service';

// Hooks
export { useNotifications } from './hooks/useNotifications';

// Components
export { NotificationsModal } from './components/notifications';

// Comments — polymorphic; scoped by entity type and id
export type { Comment, CommentEntityType, CreateCommentPayload } from './types/comment.types';
export { commentService } from './services/comment.service';
export { useComments } from './hooks/useComments';
export { useCreateComment } from './hooks/useCreateComment';
