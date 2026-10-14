/**
 * CollectionViewToggle
 *
 * Chooses which of `CollectionView`'s two presentations is showing.
 *
 * A separate control because the toggle belongs to the chrome around the view —
 * a toolbar's action slot, a page header — not inside the body it switches. It
 * carries no behaviour of its own: `mode` is the caller's state.
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useState<CollectionViewMode>( 'card' );
 *
 * <CollectionToolbar
 *     actions={<CollectionViewToggle mode={mode} onModeChange={setMode} />}
 *     …
 * />
 * ```
 */

import { useTranslation } from 'react-i18next';
import { ButtonGroup, ResponsiveButton } from '@/components/ui';
import type { CollectionViewMode } from './CollectionView.types';

export interface CollectionViewToggleProps
{
    mode: CollectionViewMode;
    onModeChange: ( mode: CollectionViewMode ) => void;
}

export function CollectionViewToggle( { mode, onModeChange }: CollectionViewToggleProps )
{
    const { t } = useTranslation();

    return (
        <ButtonGroup size="small" variant="outlined" color="inherit">
            <ResponsiveButton
                iconKey="layoutGrid"
                label={t( 'collection.view.card' )}
                // The pressed state is the whole message here, so it is
                // announced rather than left to the filled styling.
                aria-pressed={mode === 'card'}
                variant={mode === 'card' ? 'contained' : 'outlined'}
                onClick={() => onModeChange( 'card' )}
            />
            <ResponsiveButton
                iconKey="table"
                label={t( 'collection.view.table' )}
                aria-pressed={mode === 'table'}
                variant={mode === 'table' ? 'contained' : 'outlined'}
                onClick={() => onModeChange( 'table' )}
            />
        </ButtonGroup>
    );
}
