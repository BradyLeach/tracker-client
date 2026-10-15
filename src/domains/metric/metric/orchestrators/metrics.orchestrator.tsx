/**
 * metrics.orchestrator
 *
 * Supplies what the metric and formula table configs cannot express on their own: the
 * translated aggregation and unit, and the text search reads for them. A metric or
 * formula with no label is titled by its key, so the collection never shows a blank card.
 *
 * Kept out of the build*Config files so they stay declarative and JSX-free, matching the
 * companies orchestrator.
 *
 * @example
 * ```tsx
 * const METRIC_CONFIG = withMetricCellRenderers( buildMetricsTableConfig() );
 * const FORMULA_CONFIG = withFormulaCellRenderers( buildFormulasTableConfig() );
 * ```
 */

import i18n from 'i18next';
import type { TableConfig } from '@/components/tables';
import type { Metric } from '../types/metric.types';
import type { Formula } from '../../formula/types/formula.types';

/** A record's label, or its key when it has none. */
export function displayName( record: { key: string; label?: string } ): string
{
    return record.label || record.key;
}

export function aggregationLabel( metric: Metric ): string
{
    return i18n.t( `forms.metric.options.${metric.aggregation}` );
}

export function outputUnitLabel( formula: Formula ): string
{
    return i18n.t( `forms.formula.options.${formula.outputUnit}` );
}

export function withMetricCellRenderers( config: TableConfig<Metric> ): TableConfig<Metric>
{
    return {
        ...config,
        columns: config.columns.map( column =>
        {
            if( column.key === 'label' ) return { ...column, render: displayName, searchValue: displayName };
            if( column.key === 'aggregation' ) return { ...column, render: aggregationLabel, searchValue: aggregationLabel };
            return column;
        } ),
    };
}

export function withFormulaCellRenderers( config: TableConfig<Formula> ): TableConfig<Formula>
{
    return {
        ...config,
        columns: config.columns.map( column =>
        {
            if( column.key === 'label' ) return { ...column, render: displayName, searchValue: displayName };
            if( column.key === 'outputUnit' ) return { ...column, render: outputUnitLabel, searchValue: outputUnitLabel };
            return column;
        } ),
    };
}
