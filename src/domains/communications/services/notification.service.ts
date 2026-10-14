import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { Notification, NotificationSummary } from '../types/notification.types';

// TODO: Replace path constant with real endpoint when backend orchestrator is ready
// const NOTIFICATIONS_PATH = 'communications/notifications';

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: 'James Johnson',
        message: 'You: Ta penko ogohesiz figtol jonav.',
        timestamp: '2 hours ago',
        avatarUrl: '/assets/user-1-CznVQ9Sv.jpg',
    },
    {
        id: 2,
        title: 'Sarah Smith',
        message: "Looks good! I'll review it tomorrow.",
        timestamp: '5 hours ago',
        avatarUrl: '/assets/user-2-xyz.jpg',
    },
    {
        id: 3,
        title: 'Mike Wilson',
        message: 'Can we schedule a call for next week?',
        timestamp: '1 day ago',
        avatarUrl: '/assets/user-3-abc.jpg',
    },
];

export const notificationService = {
    async getSummary(): Promise<ApiResponse<NotificationSummary>>
    {
        // TODO: return await dataService.get<NotificationSummary>(NOTIFICATIONS_PATH);
        return Promise.resolve( { data: { items: MOCK_NOTIFICATIONS, newCount: 3 } } );
    },

    async dismiss( _id: number ): Promise<ApiResponse<void>>
    {
        // TODO: return await dataService.remove(NOTIFICATIONS_PATH, id);
        return Promise.resolve( { data: undefined } );
    },

    async clearAll(): Promise<ApiResponse<void>>
    {
        // TODO: return await dataService.delete(NOTIFICATIONS_PATH);
        return Promise.resolve( { data: undefined } );
    },
};
