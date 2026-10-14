/**
 * Toolbar - App UI component for app bar content layout
 *
 * Thin wrapper over CustomToolbar (MUI Toolbar + Modernize theme).
 * Provides stable import surface for navbar content organization.
 *
 * @example
 * ```tsx
 * import { Toolbar } from '@/components/ui/navigation';
 *
 * <Toolbar>
 *   <Logo />
 *   <Menu />
 * </Toolbar>
 * ```
 */
import CustomToolbar from '@/theme/theme-elements/navigation/CustomToolbar';
import type { ToolbarProps } from '@mui/material';

export function Toolbar( props: ToolbarProps )
{
    return <CustomToolbar {...props} />;
}

export default Toolbar;
