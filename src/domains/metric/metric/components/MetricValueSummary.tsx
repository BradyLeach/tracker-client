/**
 * MetricValueSummary
 *
 * A metric's current value over its rolling window, and its daily trend. Computed by the
 * server at read time, so this fetches rather than observes, and re-reads whenever the
 * metric itself changes.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, LineChart, Skeleton, Typography } from '@/components/ui';
import { formatApiError } from '@/core/utils';
import { formatScaledValue } from '@/domains/calculator';
import { useMetricValues } from '../hooks/useMetricValues';
import type { Metric } from '../types/metric.types';

export interface MetricValueSummaryProps
{
    metric: Metric;
}

const CHART_HEIGHT = 220;

export function MetricValueSummary( { metric }: MetricValueSummaryProps )
{
    const { t } = useTranslation();
    const { data, isLoading, error, refetch } = useMetricValues( metric.id, 'day' );

    // A changed definition is a different value.
    useEffect( () => { refetch(); }, [metric.updatedAt, refetch] );

    const trend = data?.trend ?? [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="overline" color="text.secondary">{t( 'pages.metrics.value' )}</Typography>
                {isLoading && !data
                    ? <Skeleton width={120} height={40} />
                    : <Typography variant="h4">{formatScaledValue( data?.value, 'count' )}</Typography>}
                <Typography variant="caption" color="text.secondary">
                    {metric.windowDays ? t( 'pages.metrics.window', { days: metric.windowDays } ) : t( 'pages.metrics.allTime' )}
                </Typography>
            </Box>

            {error && (
                <Typography role="alert" color="error">{formatApiError( t, error )}</Typography>
            )}

            {trend.length > 0 && (
                <LineChart
                    height={CHART_HEIGHT}
                    xAxis={[{ scaleType: 'point', data: trend.map( point => point.period ) }]}
                    series={[{ data: trend.map( point => point.value ?? null ), connectNulls: false }]}
                />
            )}
        </Box>
    );
}
