/**
 * AppBar - App UI component for top app bar
 *
 * Thin wrapper over CustomAppBar (MUI AppBar + Modernize theme).
 * Provides stable import surface for navbar/header layouts.
 *
 * @example
 * ```tsx
 * import { AppBar } from '@/components/ui/navigation';
 *
 * <AppBar position="sticky">
 *   <Toolbar>Content</Toolbar>
 * </AppBar>
 * ```
 */
import CustomAppBar from '@/theme/theme-elements/navigation/CustomAppBar';
import type { AppBarProps } from '@mui/material';

export function AppBar( props: AppBarProps )
{
    return <CustomAppBar {...props} />;
}

export default AppBar;
