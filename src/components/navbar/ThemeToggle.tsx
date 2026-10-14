/**
 * ThemeToggle
 *
 * The application's light/dark control. Sits at the foot of the navigation
 * rail, where the design puts it.
 *
 * Presents as a mini nav item — icon over a small label — because it lives in
 * the same column and should read as part of it. It is an action rather than
 * navigation, so it renders as a button and never takes an active state.
 *
 * Changes go through preferencesOrchestrator so the choice persists with the
 * user's other preferences rather than only for the session.
 *
 * The avatar menu still carries a Theme Settings entry. That is temporary —
 * country, currency and language move to a preferences section on the account
 * page, and this stays as the one mode switch.
 */

import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { useTheme } from '@/core/context';
import { preferencesOrchestrator } from '@/domains/preferences';
import type { ThemeMode } from '@/core/utils/constants';

export interface ThemeToggleProps
{
    /**
     * Match the surrounding menu's presentation.
     * 'mini' stacks icon over label; 'full' puts them on one row.
     */
    variant?: 'mini' | 'full';
}

export function ThemeToggle( { variant = 'mini' }: ThemeToggleProps )
{
    const { t } = useTranslation();
    const { mode, themeName } = useTheme();

    const isDark = mode === 'dark';
    const isMini = variant === 'mini';

    // Label names the mode you will get, not the one you are in.
    const label = isDark
        ? t( 'navbar.theme.light', 'Light mode' )
        : t( 'navbar.theme.dark', 'Dark mode' );

    const handleToggle = () =>
        preferencesOrchestrator.updateTheme(
            ( isDark ? 'light' : 'dark' ) as ThemeMode,
            themeName,
        );

    return (
        <Box
            component="button"
            type="button"
            onClick={handleToggle}
            aria-label={label}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMini ? 0.6 : 1.5,
                flexDirection: isMini ? 'column' : 'row',
                width: '100%',
                py: 1,
                px: isMini ? 0 : 2,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'sidebar.text',
                borderRadius: 0,
                font: 'inherit',
                '&:hover': { backgroundColor: 'sidebar.activeBg' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'sidebar.activeBorder', outlineOffset: -2 },
            }}
        >
            <IconRenderer iconKey={isDark ? 'sun' : 'moon'} size={21} />
            <Typography
                sx={{
                    fontSize: isMini ? 9 : 13,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    lineHeight: 1.2,
                    color: 'inherit',
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

export default ThemeToggle;
