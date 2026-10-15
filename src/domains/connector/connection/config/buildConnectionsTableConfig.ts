/**
 * buildConnectionsTableConfig
 *
 * Table configuration for the connections list.
 *
 * Column order follows how a connection is read:
 * 1. Connector      — which tool, from model registry.
 * 2. Label          — the account's own name for it, from model registry.
 * 3. Scheduled      — whether it pulls on a schedule, from model registry.
 * 4. Pulled through — how far its data reaches, from model registry, promoted to 'date'.
 *
 * Card slots: the connector titles the card, the label subtitles it, and the schedule and
 * reach fill its body.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Connection } from '../types/connection.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Connection> | null = null;

export function buildConnectionsTableConfig(): TableConfig<Connection>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Connection>( tableColumnFactory.getTableColumns( 'connection' ) );

    const columns: ( TableColumnConfig<Connection> | undefined )[] = [
        byKey['connectorName']
            ? {
                ...withLabel( byKey['connectorName'], 'tables.connections.columns.connectorName' ),
                sortable: true, card: 'title', emphasis: 'primary',
            }
            : {
                key: 'connectorName', label: 'tables.connections.columns.connectorName', type: 'text',
                sortable: true, card: 'title', emphasis: 'primary',
            },

        byKey['label']
            ? {
                ...withLabel( byKey['label'], 'tables.connections.columns.label' ),
                sortable: true, card: 'subtitle', emphasis: 'secondary',
            }
            : undefined,

        byKey['isActive']
            ? { ...withLabel( byKey['isActive'], 'tables.connections.columns.isActive' ), card: 'body' }
            : undefined,

        byKey['pulledThrough']
            ? {
                ...promoteType( withLabel( byKey['pulledThrough'], 'tables.connections.columns.pulledThrough' ), 'date' ),
                sortable: true, card: 'body',
            }
            : undefined,
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Connection> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.connections.emptyState.headline',
    };

    return cachedConfig;
}
