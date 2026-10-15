/**
 * ingestKeys.orchestrator
 *
 * Supplies what the ingest keys table config cannot express on its own: the key type,
 * translated, with the text search reads for it.
 *
 * Kept out of buildIngestKeysTableConfig so that file stays declarative and JSX-free,
 * matching the companies orchestrator.
 *
 * @example
 * ```tsx
 * const INGEST_KEY_CONFIG = withIngestKeyCellRenderers( buildIngestKeysTableConfig() );
 * ```
 */

import i18n from 'i18next';
import type { TableConfig } from '@/components/tables';
import type { IngestKey } from '../types/ingestKey.types';

function keyTypeLabel( ingestKey: IngestKey ): string
{
    return i18n.t( `forms.ingestKey.options.${ingestKey.keyType}` );
}

export function withIngestKeyCellRenderers( config: TableConfig<IngestKey> ): TableConfig<IngestKey>
{
    return {
        ...config,
        columns: config.columns.map( column => column.key === 'keyType'
            ? { ...column, render: keyTypeLabel, searchValue: keyTypeLabel }
            : column ),
    };
}
