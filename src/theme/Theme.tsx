import merge from 'lodash/merge';
import { createTheme, type Theme, type Components, type ThemeOptions } from '@mui/material/styles';
import * as locales from '@mui/material/locale';

import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { baseDarkTheme, baseLightTheme } from './DefaultColors';
import { THEME, THEME_MODE, type ThemeName } from '@/core/utils/constants';
import { getConfig } from '@/config';
import type { ThemeBuildConfig } from './types';

/**
 * Palettes by theme name.
 *
 * One entry today. It exists as a lookup rather than a pair of imports because the theme
 * name is already carried end to end — persisted in preferences, hydrated from the backend
 * and held in context — and this was the only point that ignored it. Adding a second theme
 * is an entry here; nothing upstream changes.
 */
const THEME_PALETTES: Record<ThemeName, { light: ThemeOptions; dark: ThemeOptions }> = {
    [THEME.STONE]: { light: baseLightTheme, dark: baseDarkTheme }
};

/**
 * Build MUI Theme
 *
 * Compiles a complete MUI theme based on provided configuration.
 * Merges base theme, color palette, shadows, typography, and locales.
 *
 * @param config - Theme configuration options
 * @returns Compiled MUI theme instance
 *
 * @example
 * const theme = BuildTheme({
 *   theme: 'cyan',
 *   mode: 'dark',
 *   direction: 'ltr',
 *   borderRadius: 7
 * });
 */
export const BuildTheme = ( config: ThemeBuildConfig = {} ): Theme =>
{
    const { ui } = getConfig();

    // Apply config defaults for missing properties
    const mode = config.mode ?? ui.activeMode;
    const direction = config.direction ?? ui.activeDir;
    const borderRadius = config.borderRadius ?? ui.borderRadius;
    const themeName = config.theme ?? ui.activeTheme;

    // Determine active mode and its dependent values
    const isDark = mode === THEME_MODE.DARK;

    // A name with no palette falls back rather than failing: the name is persisted in user
    // preferences and sent by the backend, so a theme that is retired — or one that ships
    // server-side before the client knows it — must not leave the app unable to render.
    const palettes = THEME_PALETTES[themeName] ?? THEME_PALETTES[THEME.STONE];

    const baseTheme = isDark ? palettes.dark : palettes.light;
    const themeShadows = isDark ? darkshadows : shadows;

    // Build base theme configuration
    const baseMode = {
        palette: {
            mode: mode,
        },
        shape: {
            borderRadius: borderRadius,
        },
        shadows: themeShadows,
        typography: typography,
    };

    // Merge all theme layers
    const compiledTheme = createTheme(
        merge( {}, baseMode, baseTheme, locales, {
            direction: direction,
        } ),
    );

    // Apply component overrides
    compiledTheme.components = components( compiledTheme ) as Components;

    return compiledTheme;
};