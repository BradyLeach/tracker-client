/**
 * LineChart — App UI wrapper over MUI X Charts LineChart.
 *
 * Thin passthrough. App code must never import @mui/x-charts directly.
 * ChartsReferenceLine draws a fixed value across the plot — a threshold, say — and is
 * placed as a child of the chart.
 *
 * Usage:
 *   <LineChart xAxis={[{ scaleType: 'point', data: periods }]} series={[{ data: values }]} height={240}>
 *       <ChartsReferenceLine y={threshold} label="Threshold" />
 *   </LineChart>
 */

import { LineChart as MuiLineChart, type LineChartProps } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine as MuiChartsReferenceLine, type ChartsReferenceLineProps } from '@mui/x-charts/ChartsReferenceLine';

export function LineChart( props: LineChartProps )
{
    return <MuiLineChart {...props} />;
}

export function ChartsReferenceLine( props: ChartsReferenceLineProps )
{
    return <MuiChartsReferenceLine {...props} />;
}

export type { LineChartProps, ChartsReferenceLineProps };
