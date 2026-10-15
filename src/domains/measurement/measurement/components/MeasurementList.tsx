/**
 * MeasurementList
 *
 * A source's most recent measurements, newest first, capped so a busy source's panel
 * stays readable. Deleting one is for correcting a mistaken manual entry.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IconButton, IconRenderer, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@/components/ui';
import type { Measurement } from '../types/measurement.types';

export interface MeasurementListProps
{
    measurements: Measurement[];
    onDelete?: ( measurement: Measurement ) => void;
}

/** How many of the latest measurements the panel shows. */
const RECENT_LIMIT = 25;

export function MeasurementList( { measurements, onDelete }: MeasurementListProps )
{
    const { t } = useTranslation();

    const recent = useMemo(
        () => [...measurements]
            .sort( ( first, second ) => second.occurredAt.localeCompare( first.occurredAt ) )
            .slice( 0, RECENT_LIMIT ),
        [measurements],
    );

    if( recent.length === 0 ) return <Typography variant="body2" color="text.secondary">—</Typography>;

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{t( 'tables.measurements.columns.name' )}</TableCell>
                        <TableCell>{t( 'tables.measurements.columns.occurredAt' )}</TableCell>
                        <TableCell align="right">{t( 'tables.measurements.columns.value' )}</TableCell>
                        <TableCell>{t( 'tables.measurements.columns.campaignKey' )}</TableCell>
                        {onDelete && <TableCell />}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {recent.map( measurement => (
                        <TableRow key={measurement.id}>
                            <TableCell>{measurement.name}</TableCell>
                            <TableCell>{new Date( measurement.occurredAt ).toLocaleString()}</TableCell>
                            <TableCell align="right">{measurement.value.toLocaleString()}</TableCell>
                            <TableCell>{measurement.campaignKey ?? '—'}</TableCell>
                            {onDelete && (
                                <TableCell padding="checkbox">
                                    <Tooltip title={t( 'shared.buttons.delete' )}>
                                        <IconButton
                                            size="small"
                                            aria-label={t( 'shared.buttons.delete' )}
                                            onClick={() => onDelete( measurement )}
                                        >
                                            <IconRenderer iconKey="trash" size={14} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            )}
                        </TableRow>
                    ) )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
