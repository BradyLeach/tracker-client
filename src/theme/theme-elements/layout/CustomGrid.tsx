
import { Grid, type GridProps } from '@mui/material';

/**
 * CustomGrid - Theme-element wrapper for MUI Grid
 *
 * Provides decoupled Grid primitive for responsive grid layouts.
 * Uses Grid2 (modern version) - customize here for app-wide Grid behavior.
 */
const CustomGrid = ( props: GridProps ) => <Grid {...props} />;

export default CustomGrid;
