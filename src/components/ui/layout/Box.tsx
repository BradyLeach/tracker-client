/**
 * Box - App UI component for layout composition
 *
 * Thin wrapper over CustomBox (MUI Box + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Box usage.
 *
 * @example
 * ```tsx
 * import { Box } from '@/components/ui/layout';
 *
 * <Box sx={{ p: 2, display: 'flex' }}>Content</Box>
 * ```
 */
import CustomBox from '@/theme/theme-elements/layout/CustomBox';
import type { BoxProps } from '@mui/material';
 
export function Box( props: BoxProps<any> )
{
    return <CustomBox {...props} />;
}

export default Box;
