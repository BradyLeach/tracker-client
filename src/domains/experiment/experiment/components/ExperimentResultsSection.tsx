/**
 * ExperimentResultsSection
 *
 * How the experiment is doing against its threshold: each variant's primary value, its
 * lift over control, the significance of that lift and whether it passes, then the
 * primary measure's trend per variant drawn against the threshold.
 *
 * Results are computed by the server at read time — live while the experiment runs,
 * frozen at conclusion — and this section only presents them. Values arrive as whole
 * numbers at their unit's scale; lift arrives at the ratio scale and reads as a rate.
 */

import { useTranslation } from 'react-i18next';
import {
    Box, ChartsReferenceLine, Chip, EmptyState, LineChart, MenuItem, Select, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import { formatApiError } from '@/core/utils';
import { formatScaledValue } from '@/domains/calculator';
import type { ResultGrouping, TrendPoint } from '@/domains/metric';
import type { ApiError } from '@/services/dataService/dataService.types';
import type { ExperimentResults, MeasureResult, ThresholdStatus } from '../types/experiment.types';

export interface ExperimentResultsSectionProps
{
    results: ExperimentResults | undefined;
    isLoading: boolean;
    error: ApiError | undefined;
    groupBy: ResultGrouping;
    onGroupByChange: ( groupBy: ResultGrouping ) => void;
}

const GROUPINGS: ResultGrouping[] = ['day', 'week', 'month'];

const CHART_HEIGHT = 280;

/** p-values are read to three places; smaller differences do not change a decision. */
const P_VALUE_DECIMALS = 3;

const STATUS_COLOUR: Record<ThresholdStatus, 'success' | 'error' | 'default'> = {
    pass: 'success',
    fail: 'error',
    inconclusive: 'default',
};

function primaryOf( measures: MeasureResult[] ): MeasureResult | undefined
{
    return measures.find( measure => measure.isPrimary );
}

export function ExperimentResultsSection( { results, isLoading, error, groupBy, onGroupByChange }: ExperimentResultsSectionProps )
{
    const { t } = useTranslation();
    const unknown = t( 'pages.experiment.results.unknown' );

    const variants = results?.variants ?? [];
    const hasPrimary = !!results?.primaryMeasureId;

    // Every variant's primary trend over one shared set of periods, so the lines align.
    const periods = [...new Set( variants.flatMap( variant =>
        ( primaryOf( variant.measures )?.trends[groupBy] ?? [] ).map( point => point.period ) ) )].sort();

    const series = variants.map( variant =>
    {
        const byPeriod = new Map( ( primaryOf( variant.measures )?.trends[groupBy] ?? [] )
            .map( ( point: TrendPoint ) => [point.period, point.value] ) );

        return {
            label: variant.label,
            data: periods.map( period => byPeriod.get( period ) ?? null ),
            connectNulls: false,
        };
    } );

    const threshold = results?.threshold.value;

    return (
        <ProfileSection
            title={t( 'pages.experiment.section.results' )}
            action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {results && (
                        <Chip
                            size="small"
                            variant="outlined"
                            label={t( results.frozen ? 'pages.experiment.results.frozen' : 'pages.experiment.results.live' )}
                        />
                    )}
                    <Select
                        size="small"
                        value={groupBy}
                        aria-label={t( 'pages.experiment.results.groupBy' )}
                        onChange={event => onGroupByChange( event.target.value as ResultGrouping )}
                    >
                        {GROUPINGS.map( grouping => (
                            <MenuItem key={grouping} value={grouping}>{t( `pages.experiment.results.${grouping}` )}</MenuItem>
                        ) )}
                    </Select>
                </Box>
            }
        >
            {error && (
                <Typography role="alert" color="error" sx={{ mb: 2 }}>
                    {formatApiError( t, error )}
                </Typography>
            )}

            {isLoading && !results && <Skeleton variant="rectangular" height={CHART_HEIGHT} sx={{ borderRadius: 1 }} />}

            {!isLoading && !error && ( !results || variants.length === 0 ) && (
                <EmptyState
                    size="compact"
                    icon="chartLine"
                    headline={t( 'pages.experiment.results.emptyState.headline' )}
                    subtext={t( 'pages.experiment.results.emptyState.subtext' )}
                    actions={[]}
                />
            )}

            {results && variants.length > 0 && !hasPrimary && (
                <Typography variant="body2" color="text.secondary">{t( 'pages.experiment.results.noPrimary' )}</Typography>
            )}

            {results && variants.length > 0 && hasPrimary && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell align="right">{t( 'pages.experiment.results.value' )}</TableCell>
                                    <TableCell align="right">{t( 'pages.experiment.results.lift' )}</TableCell>
                                    <TableCell align="right">{t( 'pages.experiment.results.significance' )}</TableCell>
                                    <TableCell align="right">{t( 'pages.experiment.results.status' )}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {variants.map( variant => (
                                    <TableRow key={variant.variantId}>
                                        <TableCell>
                                            {variant.isControl
                                                ? `${variant.label} · ${t( 'pages.experiment.variants.control' )}`
                                                : variant.label}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatScaledValue( variant.primary.value, undefined, undefined, unknown )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {variant.isControl
                                                ? unknown
                                                : formatScaledValue( variant.primary.lift, 'rate', undefined, unknown )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {variant.primary.significance
                                                ? variant.primary.significance.pValue.toFixed( P_VALUE_DECIMALS )
                                                : unknown}
                                        </TableCell>
                                        <TableCell align="right">
                                            {variant.primary.thresholdStatus
                                                ? (
                                                    <Chip
                                                        size="small"
                                                        color={STATUS_COLOUR[variant.primary.thresholdStatus]}
                                                        label={t( `pages.experiment.results.${variant.primary.thresholdStatus}` )}
                                                    />
                                                )
                                                : unknown}
                                        </TableCell>
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <LineChart
                        height={CHART_HEIGHT}
                        xAxis={[{ scaleType: 'point', data: periods }]}
                        series={series}
                    >
                        {typeof threshold === 'number' && (
                            <ChartsReferenceLine y={threshold} label={t( 'pages.experiment.results.threshold' )} />
                        )}
                    </LineChart>

                    <Typography variant="caption" color="text.secondary">
                        {t( 'pages.experiment.results.timeZone', { timeZone: results.timeZone } )}
                    </Typography>
                </Box>
            )}
        </ProfileSection>
    );
}
