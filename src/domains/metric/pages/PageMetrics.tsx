/**
 * PageMetrics
 *
 * The account's metrics and the formulas built from them, one tab each. Selecting a
 * metric opens its current value and trend beside the collection; selecting a formula
 * shows its expression.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search, sort and page actions
 *     CollectionView      the collection as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import {
    Box, Button, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tab, Tabs, Tooltip, Typography,
} from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useRealtimeChanges } from '@/components/shared/realtime';
import { useCollection } from '@/core/collection';
import { formatApiError } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useMetrics } from '../metric/hooks/useMetrics';
import { useDeleteMetric } from '../metric/hooks/useDeleteMetric';
import { buildMetricsTableConfig } from '../metric/config/buildMetricsTableConfig';
import { displayName, withFormulaCellRenderers, withMetricCellRenderers } from '../metric/orchestrators/metrics.orchestrator';
import { MetricDialog } from '../metric/components/MetricDialog';
import { MetricValueSummary } from '../metric/components/MetricValueSummary';
import { useFormulas } from '../formula/hooks/useFormulas';
import { useDeleteFormula } from '../formula/hooks/useDeleteFormula';
import { buildFormulasTableConfig } from '../formula/config/buildFormulasTableConfig';
import { FormulaDialog } from '../formula/components/FormulaDialog';
import type { Metric } from '../metric/types/metric.types';
import type { Formula } from '../formula/types/formula.types';

/** Resolved once — the model registry is loaded by this point. */
const METRIC_CONFIG = withMetricCellRenderers( buildMetricsTableConfig() );
const FORMULA_CONFIG = withFormulaCellRenderers( buildFormulasTableConfig() );

/** Sort choices come from each config's own `sortable` flags, so labels are not written twice. */
const sortOptionsOf = ( columns: { key: string; label: string; sortable?: boolean }[] ): CollectionSortOption[] =>
    columns.filter( column => column.sortable ).map( ( { key, label } ) => ( { key, label } ) );

const METRIC_SORT_OPTIONS = sortOptionsOf( METRIC_CONFIG.columns );
const FORMULA_SORT_OPTIONS = sortOptionsOf( FORMULA_CONFIG.columns );

type MetricsTab = 'metrics' | 'formulas';

export function PageMetrics()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: metrics = [], isLoading: metricsLoading, error: metricsError, refresh: refreshMetrics } = useMetrics();
    const { data: formulas = [], isLoading: formulasLoading, error: formulasError, refresh: refreshFormulas } = useFormulas();
    const metricChanges = useRealtimeChanges( 'metric' );
    const formulaChanges = useRealtimeChanges( 'formula' );

    const [tab, setTab] = useState<MetricsTab>( 'metrics' );
    const [viewMode, setViewMode] = useCollectionViewMode( 'metrics' );
    const [selectedId, setSelectedId] = useState<string>();

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [metricDialog, setMetricDialog] = useState<{ metric: Metric | null } | null>( null );
    const [formulaDialog, setFormulaDialog] = useState<{ formula: Formula | null } | null>( null );
    const [confirmingDelete, setConfirmingDelete] = useState( false );

    const deleteMetric = useDeleteMetric();
    const deleteFormula = useDeleteFormula();

    const metricCollection = useCollection( metrics, { fields: METRIC_CONFIG.columns, alphaKey: 'key' } );
    const formulaCollection = useCollection( formulas, { fields: FORMULA_CONFIG.columns, alphaKey: 'key' } );

    const isMetrics = tab === 'metrics';
    const collection = isMetrics ? metricCollection : formulaCollection;

    const selectedMetric = isMetrics ? metrics.find( metric => metric.id === selectedId ) : undefined;
    const selectedFormula = isMetrics ? undefined : formulas.find( formula => formula.id === selectedId );
    const selected = selectedMetric ?? selectedFormula;

    const changeTab = ( next: MetricsTab ) =>
    {
        setTab( next );
        setSelectedId( undefined );
    };

    const toggleSelected = ( row: { id: string } ) =>
        setSelectedId( previous => previous === row.id ? undefined : row.id );

    const refreshPage = () =>
    {
        refreshMetrics();
        refreshFormulas();
    };

    const editSelected = () =>
    {
        if( selectedMetric ) setMetricDialog( { metric: selectedMetric } );
        if( selectedFormula ) setFormulaDialog( { formula: selectedFormula } );
    };

    const handleDelete = async () =>
    {
        setConfirmingDelete( false );
        if( selectedMetric ) await deleteMetric.mutateAsync( selectedMetric.id ).catch( () => undefined );
        if( selectedFormula ) await deleteFormula.mutateAsync( selectedFormula.id ).catch( () => undefined );
        setSelectedId( undefined );
    };

    const error = ( isMetrics ? metricsError : formulasError ) ?? deleteMetric.error ?? deleteFormula.error;

    return (
        <Page title={t( 'pages.metrics.title' )} description={t( 'pages.metrics.description' )}>
            <NavbarLayout
                title={t( 'pages.metrics.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        fullWidth={isDesktop ? 500 : '100%'}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedId( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <DetailPanelHeader
                                    iconKey={selectedMetric ? 'chartLine' : 'calculator'}
                                    title={displayName( selected )}
                                    onEdit={editSelected}
                                    actions={
                                        <Tooltip title={t( 'shared.buttons.moreActions' )}>
                                            <IconButton
                                                size="small"
                                                aria-label={t( 'shared.buttons.moreActions' )}
                                                aria-haspopup="true"
                                                aria-expanded={menuAnchor ? 'true' : undefined}
                                                onClick={( event ) => setMenuAnchor( event.currentTarget )}
                                            >
                                                <IconRenderer iconKey="dotsVertical" size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    onClose={() => setSelectedId( undefined )}
                                />

                                <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor( null )}>
                                    <MenuItem
                                        onClick={() =>
                                        {
                                            setMenuAnchor( null );
                                            setConfirmingDelete( true );
                                        }}
                                        sx={{ color: 'danger.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconRenderer iconKey="trash" size={16} />
                                            {t( 'shared.buttons.delete' )}
                                        </Box>
                                    </MenuItem>
                                </Menu>

                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
                                    {selectedMetric && <MetricValueSummary metric={selectedMetric} />}
                                    {selectedFormula && (
                                        <>
                                            <Typography variant="overline" color="text.secondary">
                                                {t( 'tables.formulas.columns.expression' )}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                                {selectedFormula.expression}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </SidePanel>
                }
            >
                <Tabs value={tab} onChange={( _event, next: MetricsTab ) => changeTab( next )} sx={{ mb: 2 }}>
                    <Tab value="metrics" label={t( 'pages.metrics.title' )} />
                    <Tab value="formulas" label={t( 'pages.metrics.formulasTitle' )} />
                </Tabs>

                <Box sx={{ mb: 2 }}>
                    <CollectionToolbar
                        search={collection.search}
                        onSearchChange={collection.setSearch}
                        searchPlaceholder={t( 'pages.metrics.searchPlaceholder' )}
                        sortOptions={isMetrics ? METRIC_SORT_OPTIONS : FORMULA_SORT_OPTIONS}
                        sortKey={collection.sortKey}
                        sortDir={collection.sortDir}
                        onSortChange={collection.toggleSort}
                        actions={
                            <>
                                <CollectionViewToggle mode={viewMode} onModeChange={setViewMode} />
                                <ResponsiveButton
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    iconKey="plus"
                                    label={t( isMetrics ? 'pages.metrics.addButton' : 'pages.metrics.addFormulaButton' )}
                                    onClick={() => isMetrics
                                        ? setMetricDialog( { metric: null } )
                                        : setFormulaDialog( { formula: null } )}
                                />
                                <Tooltip title={t( 'shared.buttons.refresh' )}>
                                    <IconButton
                                        aria-label={t( 'shared.buttons.refresh' )}
                                        onClick={refreshPage}
                                        sx={{ color: 'text.muted' }}
                                    >
                                        <IconRenderer iconKey="refresh" size={18} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        }
                    />
                </Box>

                {error && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, error )}
                    </Typography>
                )}

                {isMetrics
                    ? (
                        <CollectionView<Metric>
                            mode={viewMode}
                            rows={metricCollection.visibleRows}
                            columns={METRIC_CONFIG.columns}
                            getRowId={metric => metric.id}
                            selectedRowId={selectedId}
                            onRowClick={toggleSelected}
                            sortKey={metricCollection.sortKey}
                            sortDir={metricCollection.sortDir}
                            onSortChange={metricCollection.toggleSort}
                            isLoading={metricsLoading}
                            isEmpty={!metricsError && metrics.length === 0}
                            emptyState={
                                <EmptyState
                                    icon="chartLine"
                                    headline={t( 'pages.metrics.emptyState.headline' )}
                                    subtext={t( 'pages.metrics.emptyState.subtext' )}
                                    actions={[{
                                        label: t( 'pages.metrics.addButton' ),
                                        variant: 'contained',
                                        onClick: () => setMetricDialog( { metric: null } ),
                                    }]}
                                />
                            }
                            getRowChangeNonce={metric => metricChanges[metric.id] ?? 0}
                        />
                    )
                    : (
                        <CollectionView<Formula>
                            mode={viewMode}
                            rows={formulaCollection.visibleRows}
                            columns={FORMULA_CONFIG.columns}
                            getRowId={formula => formula.id}
                            selectedRowId={selectedId}
                            onRowClick={toggleSelected}
                            sortKey={formulaCollection.sortKey}
                            sortDir={formulaCollection.sortDir}
                            onSortChange={formulaCollection.toggleSort}
                            isLoading={formulasLoading}
                            isEmpty={!formulasError && formulas.length === 0}
                            emptyState={
                                <EmptyState
                                    icon="calculator"
                                    headline={t( 'pages.metrics.formulaEmptyState.headline' )}
                                    subtext={t( 'pages.metrics.formulaEmptyState.subtext' )}
                                    actions={[{
                                        label: t( 'pages.metrics.addFormulaButton' ),
                                        variant: 'contained',
                                        onClick: () => setFormulaDialog( { formula: null } ),
                                    }]}
                                />
                            }
                            getRowChangeNonce={formula => formulaChanges[formula.id] ?? 0}
                        />
                    )}

                <MetricDialog
                    open={metricDialog != null}
                    metric={metricDialog?.metric ?? null}
                    onClose={() => setMetricDialog( null )}
                    onCreated={setSelectedId}
                />

                <FormulaDialog
                    open={formulaDialog != null}
                    formula={formulaDialog?.formula ?? null}
                    onClose={() => setFormulaDialog( null )}
                />

                <MessageDialog
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete( false )}
                    title={t( 'pages.metrics.deleteConfirm.title' )}
                    actions={
                        <>
                            <Button onClick={() => setConfirmingDelete( false )} variant="text">
                                {t( 'shared.buttons.cancel' )}
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="error">
                                {t( 'shared.buttons.delete' )}
                            </Button>
                        </>
                    }
                >
                    <Typography>
                        {t( 'pages.metrics.deleteConfirm.body', { name: selected ? displayName( selected ) : '' } )}
                    </Typography>
                </MessageDialog>

            </NavbarLayout>
        </Page>
    );
}

export default PageMetrics;
