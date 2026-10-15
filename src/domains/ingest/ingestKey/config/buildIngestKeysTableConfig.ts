/**
 * buildIngestKeysTableConfig
 *
 * Table configuration for the ingest keys list.
 *
 * Column order follows how a key is recognised:
 * 1. Key         — the label, from model registry.
 * 2. Type        — public or secret, from model registry.
 * 3. Starts with — the key's prefix, the only part ever shown again, from model registry.
 * 4. Revoked     — when it stopped working, from model registry, promoted to 'date'.
 *
 * Card slots: the label titles the card, the prefix subtitles it, and the type and
 * revocation fill its body.
 *
 * Type carries no renderer here: it translates, so the orchestrator supplies it and this
 * file stays free of JSX and i18n lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { IngestKey } from '../types/ingestKey.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<IngestKey> | null = null;

export function buildIngestKeysTableConfig(): TableConfig<IngestKey>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<IngestKey>( tableColumnFactory.getTableColumns( 'ingestKey' ) );

    const columns: ( TableColumnConfig<IngestKey> | undefined )[] = [
        byKey['label']
            ? {
                ...withLabel( byKey['label'], 'tables.ingestKeys.columns.label' ),
                sortable: true, card: 'title', emphasis: 'primary',
            }
            : {
                key: 'label', label: 'tables.ingestKeys.columns.label', type: 'text',
                sortable: true, card: 'title', emphasis: 'primary',
            },

        // Translated by the orchestrator.
        byKey['keyType']
            ? { ...withLabel( byKey['keyType'], 'tables.ingestKeys.columns.keyType' ), sortable: true, card: 'body' }
            : undefined,

        byKey['keyPrefix']
            ? { ...withLabel( byKey['keyPrefix'], 'tables.ingestKeys.columns.keyPrefix' ), card: 'subtitle', emphasis: 'secondary' }
            : undefined,

        byKey['revokedAt']
            ? {
                ...promoteType( withLabel( byKey['revokedAt'], 'tables.ingestKeys.columns.revokedAt' ), 'date' ),
                sortable: true, card: 'body',
            }
            : undefined,
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<IngestKey> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.ingestKeys.emptyState.headline',
    };

    return cachedConfig;
}
