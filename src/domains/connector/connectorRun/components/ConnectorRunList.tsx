/**
 * ConnectorRunList
 *
 * A connection's runs, newest first: what kind of run, how it went, how many measurements
 * it wrote and when it started. A failed run carries the connector's message beneath it.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@/components/ui';
import type { ConnectorRun, ConnectorRunStatus } from '../types/connectorRun.types';

export interface ConnectorRunListProps
{
    runs: ConnectorRun[];
}

const STATUS_COLOUR: Record<ConnectorRunStatus, 'default' | 'success' | 'error'> = {
    running: 'default',
    succeeded: 'success',
    failed: 'error',
};

export function ConnectorRunList( { runs }: ConnectorRunListProps )
{
    const { t } = useTranslation();

    const newestFirst = useMemo(
        () => [...runs].sort( ( first, second ) => second.startedAt.localeCompare( first.startedAt ) ),
        [runs],
    );

    if( newestFirst.length === 0 )
    {
        return <Typography variant="body2" color="text.secondary">{t( 'pages.connections.noRuns' )}</Typography>;
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{t( 'tables.connectorRuns.columns.kind' )}</TableCell>
                        <TableCell>{t( 'tables.connectorRuns.columns.status' )}</TableCell>
                        <TableCell align="right">{t( 'tables.connectorRuns.columns.measurementCount' )}</TableCell>
                        <TableCell align="right">{t( 'tables.connectorRuns.columns.startedAt' )}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {newestFirst.map( run => (
                        <TableRow key={run.id}>
                            <TableCell>{t( `pages.connections.runKinds.${run.kind}` )}</TableCell>
                            <TableCell>
                                <Chip
                                    size="small"
                                    color={STATUS_COLOUR[run.status]}
                                    label={t( `pages.connections.runStatuses.${run.status}` )}
                                />
                                {run.errorMessage && (
                                    <Box>
                                        <Typography variant="caption" color="error">{run.errorMessage}</Typography>
                                    </Box>
                                )}
                            </TableCell>
                            <TableCell align="right">{run.measurementCount?.toLocaleString() ?? '—'}</TableCell>
                            <TableCell align="right">{new Date( run.startedAt ).toLocaleString()}</TableCell>
                        </TableRow>
                    ) )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
