/**
 * measurementSources.orchestrator
 *
 * Supplies what the sources table config cannot express on its own: what a source
 * delivers, translated, and the measurement names it may write, joined for reading. A
 * source with no label is titled by its key, so the collection never shows a blank card.
 *
 * Kept out of buildMeasurementSourcesTableConfig so that file stays declarative and
 * JSX-free, matching the companies orchestrator.
 *
 * @example
 * ```tsx
 * const SOURCE_CONFIG = withMeasurementSourceCellRenderers( buildMeasurementSourcesTableConfig() );
 * ```
 */

import i18n from 'i18next';
import type { TableConfig } from '@/components/tables';
import type { MeasurementSource } from '../types/measurementSource.types';

/** A source's label, or its key when it has none. */
export function sourceName( source: MeasurementSource ): string
{
    return source.label || source.key;
}

function deliversLabel( source: MeasurementSource ): string
{
    return i18n.t( `forms.measurementSource.options.${source.sourceType}` );
}

function measurementNames( source: MeasurementSource ): string
{
    return source.allowedMeasurementNames.join( ', ' ) || '—';
}

export function withMeasurementSourceCellRenderers( config: TableConfig<MeasurementSource> ): TableConfig<MeasurementSource>
{
    return {
        ...config,
        columns: config.columns.map( column =>
        {
            if( column.key === 'label' ) return { ...column, render: sourceName, searchValue: sourceName };
            if( column.key === 'sourceType' ) return { ...column, render: deliversLabel, searchValue: deliversLabel };
            if( column.key === 'allowedMeasurementNames' )
            {
                return { ...column, render: measurementNames, searchValue: measurementNames };
            }
            return column;
        } ),
    };
}
