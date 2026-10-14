/**
 * LocationViewToggle
 *
 * Chooses which of `LocationView`'s two presentations is showing.
 *
 * A separate control because the toggle belongs to the chrome around the view —
 * a `ProfileSection` action slot, a page header — not inside the body it
 * switches. It carries no behaviour of its own: `mode` is the caller's state.
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useState<LocationViewMode>( 'list' );
 *
 * <ProfileSection title={t( 'pages.company.section.location' )} action={
 *     <LocationViewToggle mode={mode} onModeChange={setMode} />
 * }>
 *     <LocationView pins={pins} mode={mode} height={320} emptyMessage="pages.company.location.empty" />
 * </ProfileSection>
 * ```
 */

import { useTranslation } from 'react-i18next';
import { ButtonGroup, ResponsiveButton } from '@/components/ui';
import type { LocationViewMode } from './LocationView.types';

export interface LocationViewToggleProps
{
    mode: LocationViewMode;
    onModeChange: ( mode: LocationViewMode ) => void;
}

export function LocationViewToggle( { mode, onModeChange }: LocationViewToggleProps )
{
    const { t } = useTranslation();

    return (
        <ButtonGroup size="small" variant="outlined" color="inherit">
            <ResponsiveButton
                iconKey="list"
                label={t( 'collection.view.list' )}
                // The pressed state is the whole message here, so it is
                // announced rather than left to the filled styling.
                aria-pressed={mode === 'list'}
                variant={mode === 'list' ? 'contained' : 'outlined'}
                onClick={() => onModeChange( 'list' )}
            />
            <ResponsiveButton
                iconKey="map"
                label={t( 'collection.view.map' )}
                aria-pressed={mode === 'map'}
                variant={mode === 'map' ? 'contained' : 'outlined'}
                onClick={() => onModeChange( 'map' )}
            />
        </ButtonGroup>
    );
}

export default LocationViewToggle;
