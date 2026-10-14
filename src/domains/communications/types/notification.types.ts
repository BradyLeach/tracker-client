export interface Notification
{
    id: number;
    title: string;
    message?: string;
    timestamp: string;
    avatarUrl?: string;
    isNew?: boolean;
}

export interface NotificationSummary
{
    items: Notification[];
    newCount: number;
}
