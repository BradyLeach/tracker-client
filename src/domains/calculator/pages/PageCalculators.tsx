/**
 * PageCalculators
 *
 * Every built-in calculator, usable on its own. The library is grouped by category;
 * selecting a calculator opens it beside the library, where its inputs are entered and
 * the server works out the result.
 *
 * The library is the registry: nothing here lists a calculator or an input.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search and sort
 *     CollectionView      the library as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { Box, Typography } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { formatApiError } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useCalculators } from '../hooks/useCalculators';
import { buildCalculatorsTableConfig } from '../config/buildCalculatorsTableConfig';
import { calculatorCategory, calculatorName, withCalculatorCellRenderers } from '../orchestrators/calculators.orchestrator';
import { CalculatorRunner } from '../components/CalculatorRunner';
import type { CalculatorDescriptor } from '../types/calculator.types';

const CALCULATOR_CONFIG = withCalculatorCellRenderers( buildCalculatorsTableConfig() );

const SORT_OPTIONS: CollectionSortOption[] = CALCULATOR_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

/** Name and category sort by what they read as, not by the registry key behind them. */
const SORT_VALUES = { key: calculatorName, category: calculatorCategory };

export function PageCalculators()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: calculators = [], isLoading, error } = useCalculators();

    const [selectedKey, setSelectedKey] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'calculators' );

    const toggleSelected = ( descriptor: CalculatorDescriptor ) =>
        setSelectedKey( previous => previous === descriptor.key ? undefined : descriptor.key );

    const selected = calculators.find( descriptor => descriptor.key === selectedKey );

    const collection = useCollection( calculators, {
        fields: CALCULATOR_CONFIG.columns,
        sortValues: SORT_VALUES,
        initialState: { sort: { key: 'key', direction: 'asc' } },
    } );

    return (
        <Page title={t( 'pages.calculators.title' )} description={t( 'pages.calculators.description' )}>
            <NavbarLayout
                title={t( 'pages.calculators.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        fullWidth={isDesktop ? 500 : '100%'}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedKey( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <DetailPanelHeader
                                    iconKey="calculator"
                                    title={calculatorName( selected )}
                                    onClose={() => setSelectedKey( undefined )}
                                />
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
                                    <CalculatorRunner key={selected.key} descriptor={selected} />
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
                        searchPlaceholder={t( 'pages.calculators.searchPlaceholder' )}
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

                <CollectionView<CalculatorDescriptor>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={CALCULATOR_CONFIG.columns}
                    getRowId={descriptor => descriptor.key}
                    selectedRowId={selectedKey}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    emptyMessage="pages.calculators.noMatches"
                    groupBy="category"
                    groupLabel={( _rows, key ) => `calculators.categories.${key}`}
                />
            </NavbarLayout>
        </Page>
    );
}

export default PageCalculators;
