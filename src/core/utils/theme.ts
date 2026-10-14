import { logger } from '@/core/utils/logger';
import { getConfig } from '@/config';
import { getContext, hydrateContextBulk } from '@/core/context';

/**
 * Reset theme settings to defaults
 *
 * Resets theme to config defaults via context hydration.
 * Note: This only affects the current session - no persistence.
 */
export const resetToDefaultTheme = (): void =>
{
    const { ui } = getConfig();

    hydrateContextBulk( {
        theme: {
            mode: ui.activeMode,
            direction: ui.activeDir,
            themeName: ui.activeTheme,
        },
    } );

    logger.info( 'Theme settings reset to config defaults.' );
};

/**
 * Debug theme settings
 *
 * Logs the current theme settings from context
 * alongside the default values from config.
 */
export const debugThemeSettings = (): void =>
{
    const { ui } = getConfig();
    const { theme } = getContext();

    logger.debug( 'Theme Debug Info', {
        configDefaults: {
            themeName: ui.activeTheme,
            mode: ui.activeMode,
            direction: ui.activeDir,
            borderRadius: ui.borderRadius,
        },
        currentContext: {
            themeName: theme.themeName,
            mode: theme.mode,
            direction: theme.direction,
        },
    } );
};
