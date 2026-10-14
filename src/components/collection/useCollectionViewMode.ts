/**
 * useCollectionViewMode
 *
 * The view mode for one collection, persisted per collection so each page
 * reopens in the mode it was last left in. Switching one collection never
 * changes another.
 *
 * Usage:
 *   const [viewMode, setViewMode] = useCollectionViewMode( 'formulas' );
 */

import { useState } from 'react';
import { preferenceStorage } from '@/core/utils/storage';
import type { CollectionViewMode } from './CollectionView.types';

const DEFAULT_VIEW_MODE: CollectionViewMode = 'card';

export function useCollectionViewMode(
    collectionKey: string,
): [CollectionViewMode, ( mode: CollectionViewMode ) => void]
{
    const storageKey = `collection:${collectionKey}:viewMode`;

    const [viewMode, setViewModeState] = useState<CollectionViewMode>( () =>
        preferenceStorage.get<CollectionViewMode>( storageKey, DEFAULT_VIEW_MODE )
    );

    // Wrapped setter that persists to localStorage
    const setViewMode = ( mode: CollectionViewMode ) =>
    {
        setViewModeState( mode );
        preferenceStorage.set( storageKey, mode );
    };

    return [viewMode, setViewMode];
}
