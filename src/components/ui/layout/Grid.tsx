/**
 * Grid - App UI component for responsive grid layouts
 *
 * Thin wrapper over CustomGrid (MUI Grid2 + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Grid usage.
 *
 * @example
 * ```tsx
 * import { Grid } from '@/components/ui/layout';
 *
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}>Column 1</Grid>
 *   <Grid size={{ xs: 12, md: 6 }}>Column 2</Grid>
 * </Grid>
 * ```
 */
import CustomGrid from '@/theme/theme-elements/layout/CustomGrid';
import type { GridProps } from '@mui/material';

export function Grid( props: GridProps )
{
    return <CustomGrid {...props} />;
}

export default Grid;
