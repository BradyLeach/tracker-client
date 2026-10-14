/**
 * ProfileModals Component
 *
 * Renders open modals for ProfileMenu in one place.
 * Keeps ProfileMenu lean and focused on menu rendering.
 *
 * Modals are registered in modalRegistry and rendered dynamically.
 */
import { useState } from 'react';
import { modalRegistry } from './modalRegistry';

type ModalKey = keyof typeof modalRegistry;

/**
 * Hook to manage open/close state of all registered profile modals.
 */
export function useProfileModals()
{
    const [states, setStates] = useState<Record<ModalKey, boolean>>( {
        notifications: false,
        language: false,
        currency: false,
        country: false,
        theme: false,
    } );

    const openModal = ( key: ModalKey ) => setStates( prev => ( { ...prev, [key]: true } ) );
    const closeModal = ( key: ModalKey ) => setStates( prev => ( { ...prev, [key]: false } ) );

    const onClose = Object.fromEntries(
        Object.keys( states ).map( key => [key, () => closeModal( key as ModalKey )] )
    ) as Record<ModalKey, () => void>;

    return { openStates: states, onClose, openModal };
}

export function ProfileModals( {
    openStates,
    onClose,
}: {
    openStates: Record<ModalKey, boolean>;
    onClose: Record<ModalKey, () => void>;
} )
{
    return (
        <>
            {Object.entries( modalRegistry ).filter( ( [key] ) => openStates[key as ModalKey] ).map( ( [key, Modal] ) => (
                <Modal
                    key={key}
                    open={openStates[key as ModalKey]}
                    onClose={onClose[key as ModalKey]}
                />
            ) )}
        </>
    );
}
