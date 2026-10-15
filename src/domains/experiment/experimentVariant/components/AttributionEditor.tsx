/**
 * AttributionEditor
 *
 * Edits a variant's attribution: for each measurement source, the filters a measurement
 * must match to count toward this variant. A source with no entry contributes nothing,
 * and a source entry with no filters counts every measurement that source writes.
 *
 * Each source is offered once, and its filters may reference only the dimension keys
 * that source is allowed to write.
 *
 * Controlled: the parent holds the list and receives the whole new list on every change.
 */

import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, IconRenderer, MenuItem, Select, Tooltip, Typography } from '@/components/ui';
import { DimensionFilterEditor } from '@/domains/metric';
import type { MeasurementSource } from '@/domains/measurement';
import type { AttributionEntry } from '../types/experimentVariant.types';

export interface AttributionEditorProps
{
    value: AttributionEntry[];
    onChange: ( value: AttributionEntry[] ) => void;
    sources: readonly MeasurementSource[];
    disabled?: boolean;
}

export function AttributionEditor( { value, onChange, sources, disabled }: AttributionEditorProps )
{
    const { t } = useTranslation();

    const sourcesById = new Map( sources.map( source => [source.id, source] ) );
    const usedIds = new Set( value.map( entry => entry.measurementSourceId ) );
    const unusedSources = sources.filter( source => !usedIds.has( source.id ) );

    const replace = ( index: number, next: Partial<AttributionEntry> ) =>
        onChange( value.map( ( entry, position ) => position === index ? { ...entry, ...next } : entry ) );

    const remove = ( index: number ) => onChange( value.filter( ( _entry, position ) => position !== index ) );

    const add = () =>
    {
        const [next] = unusedSources;
        if( next ) onChange( [...value, { measurementSourceId: next.id, filters: [] }] );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="subtitle2">{t( 'forms.experimentVariant.attributionTitle' )}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t( 'forms.experimentVariant.attributionSubtitle' )}
                </Typography>
            </Box>

            {value.map( ( entry, index ) =>
            {
                const source = sourcesById.get( entry.measurementSourceId );

                return (
                    <Box
                        key={entry.measurementSourceId}
                        sx={{ border: '1px solid', borderColor: 'border.base', borderRadius: 1, p: 2 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Select
                                size="small"
                                value={entry.measurementSourceId}
                                disabled={disabled}
                                sx={{ flex: 1 }}
                                // A source change clears the filters: they named the old source's dimensions.
                                onChange={event => replace( index, {
                                    measurementSourceId: String( event.target.value ),
                                    filters: [],
                                } )}
                            >
                                {sources
                                    .filter( option => option.id === entry.measurementSourceId || !usedIds.has( option.id ) )
                                    .map( option => (
                                        <MenuItem key={option.id} value={option.id}>{option.label ?? option.key}</MenuItem>
                                    ) )}
                            </Select>
                            <Tooltip title={t( 'shared.buttons.delete' )}>
                                <span>
                                    <IconButton
                                        size="small"
                                        aria-label={t( 'shared.buttons.delete' )}
                                        disabled={disabled}
                                        onClick={() => remove( index )}
                                    >
                                        <IconRenderer iconKey="trash" size={16} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        <DimensionFilterEditor
                            value={entry.filters}
                            onChange={filters => replace( index, { filters } )}
                            allowedDimensionKeys={source?.allowedDimensionKeys ?? []}
                            disabled={disabled}
                        />
                    </Box>
                );
            } )}

            <Box>
                <Button
                    size="small"
                    variant="outlined"
                    disabled={disabled || unusedSources.length === 0}
                    startIcon={<IconRenderer iconKey="plus" size={16} />}
                    onClick={add}
                >
                    {t( 'forms.experimentVariant.addSource' )}
                </Button>
            </Box>
        </Box>
    );
}
