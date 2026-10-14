/**
 * useNotifications Hook
 *
 * Owns all notification state and mutations.
 * Tracks which notifications have been seen (were visible when modal was last closed)
 * so components can highlight new arrivals without backend read/unread semantics.
 */
import { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../types/notification.types';

interface UseNotificationsState
{
    notifications: Notification[];
    newCount: number;
    isLoading: boolean;
    error: any;
    dismiss: ( id: number ) => void;
    clearAll: () => void;
    clearNewCount: () => void;
    markAllAsSeen: () => void;
}

// Persists across renders within the session.
// IDs present here were visible the last time the modal was closed.
const seenIds = new Set<number>();

// Dev only — direct access for playground injection
export const _devSeenIds = seenIds;

export function useNotifications(): UseNotificationsState
{
    const [notifications, setNotifications] = useState<Notification[]>( [] );
    const [newCount, setNewCount] = useState( 0 );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<any>( null );

    useEffect( () =>
    {
        notificationService.getSummary().then( response =>
        {
            if( response.error )
            {
                setError( response.error );
            }
            else if( response.data )
            {
                setNotifications(
                    response.data.items.map( n => ( { ...n, isNew: !seenIds.has( n.id ) } ) )
                );
                setNewCount( response.data.newCount );
            }
            setIsLoading( false );
        } );
    }, [] );

    const dismiss = ( id: number ) =>
    {
        seenIds.add( id );
        setNotifications( prev => prev.filter( n => n.id !== id ) );
        void notificationService.dismiss( id );
    };

    const clearAll = () =>
    {
        seenIds.clear();
        setNotifications( [] );
        void notificationService.clearAll();
    };

    const clearNewCount = () => setNewCount( 0 );

    const markAllAsSeen = () =>
    {
        setNotifications( prev =>
        {
            prev.forEach( n => seenIds.add( n.id ) );
            return prev.map( n => ( { ...n, isNew: false } ) );
        } );
    };

    return { notifications, newCount, isLoading, error, dismiss, clearAll, clearNewCount, markAllAsSeen };
}
