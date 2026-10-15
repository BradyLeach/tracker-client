/**
 * PageLearnings
 *
 * What every concluded experiment showed, searchable in one place — by what was learned
 * or by the experiment it came from. Selecting a learning opens it in full beside the
 * collection, with the way back to its experiment.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search and sort
 *     CollectionView      the collection as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { Box, EmptyState, Typography } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { formatApiError } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useExperiments } from '../experiment/hooks/useExperiments';
import { useLearnings } from '../learning/hooks/useLearnings';
import { buildLearningsTableConfig } from '../learning/config/buildLearningsTableConfig';
import {
    indexExperimentsById,
    learningSortValues,
    withLearningCellRenderers,
} from '../learning/orchestrators/learnings.orchestrator';
import type { Learning } from '../learning/types/learning.types';

/** Resolved once — the model registry is loaded by this point. */
const LEARNING_CONFIG = buildLearningsTableConfig();

const SORT_OPTIONS: CollectionSortOption[] = LEARNING_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

export function PageLearnings()
{
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();

    const { data: learnings = [], isLoading, error } = useLearnings();
    const { data: experiments = [] } = useExperiments();

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'learnings' );

    const toggleSelected = ( learning: Learning ) =>
        setSelectedId( previous => previous === learning.id ? undefined : learning.id );

    const selected = learnings.find( learning => learning.id === selectedId );

    /** One index over the experiments, read by the renderers, the search and the sort. */
    const experimentsById = useMemo( () => indexExperimentsById( experiments ), [experiments] );

    const config = useMemo(
        () => withLearningCellRenderers( LEARNING_CONFIG, experimentsById ),
        [experimentsById],
    );
    const sortValues = useMemo( () => learningSortValues( experimentsById ), [experimentsById] );

    const collection = useCollection( learnings, {
        // The orchestrated config: its experiment column carries the title search reads.
        fields: config.columns,
        sortValues,
        initialState: { sort: { key: 'createdAt', direction: 'desc' } },
    } );

    const selectedExperiment = selected ? experimentsById.get( selected.experimentId ) : undefined;

    return (
        <Page title={t( 'pages.learnings.title' )} description={t( 'pages.learnings.description' )}>
            <NavbarLayout
                title={t( 'pages.learnings.title' )}
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
                                    iconKey="bulb"
                                    title={selectedExperiment?.title ?? t( 'pages.learnings.title' )}
                                    onExpand={() => navigate( `/experiments/${selected.experimentId}` )}
                                    onClose={() => setSelectedId( undefined )}
                                />
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selected.body}</Typography>
                                    {selected.createdAt && (
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date( selected.createdAt ).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </SidePanel>
                }
            >
                <Box sx={{ mb: 2 }}>
                    <CollectionToolbar
                        search={collection.search}
                        onSearchChange={collection.setSearch}
                        searchPlaceholder={t( 'pages.learnings.searchPlaceholder' )}
                        sortOptions={SORT_OPTIONS}
                        sortKey={collection.sortKey}
                        sortDir={collection.sortDir}
                        onSortChange={collection.toggleSort}
                        actions={<CollectionViewToggle mode={viewMode} onModeChange={setViewMode} />}
                    />
                </Box>

                {error && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, error )}
                    </Typography>
                )}

                <CollectionView<Learning>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={config.columns}
                    getRowId={learning => learning.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={!error && learnings.length === 0}
                    emptyState={
                        <EmptyState
                            icon="bulb"
                            headline={t( 'pages.learnings.emptyState.headline' )}
                            subtext={t( 'pages.learnings.emptyState.subtext' )}
                            actions={[]}
                        />
                    }
                />
            </NavbarLayout>
        </Page>
    );
}

export default PageLearnings;
