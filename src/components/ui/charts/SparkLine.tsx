/**
 * SparkLine — App UI wrapper over MUI X Charts SparkLineChart.
 *
 * Thin passthrough. App code must never import @mui/x-charts directly.
 *
 * Usage:
 *   <SparkLine data={[3, 7, 2, 8, 5]} width={120} height={36} colors={['#5D87FF']} />
 */

import { SparkLineChart, type SparkLineChartProps } from '@mui/x-charts/SparkLineChart';

export function SparkLine( { color, ...props }: SparkLineChartProps )
{
    return <SparkLineChart color={color} {...props} />;
}

export type { SparkLineChartProps as SparkLineProps };
