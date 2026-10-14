/**
 * useIsDesktop
 *
 * The single width at which the app switches between its permanent and its
 * overlay layouts — the nav rail and every detail panel hand off together.
 *
 * Reads the theme's `md` breakpoint rather than a literal, so the value lives
 * in one place and a page cannot drift from the shell.
 */

import { useMediaQuery, useTheme } from '@/components/ui';

export function useIsDesktop(): boolean
{
    const theme = useTheme();
    return useMediaQuery( theme.breakpoints.up( 'md' ) );
}

export default useIsDesktop;
