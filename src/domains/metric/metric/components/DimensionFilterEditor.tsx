/**
 * DimensionFilterEditor
 *
 * Edits a list of dimension filters — the one filter language metrics and experiment
 * attribution share. Each row matches a dimension by key, or the source's campaign
 * key, against one value ('equals') or several ('in'); a measurement counts only when
 * it matches every row.
 *
 * Dimension keys are offered from the source's allowed set, never typed, so a filter
 * cannot reference a dimension the source is not permitted to write.
 *
 * Controlled: the parent holds the list and receives the whole new list on every change.
 */

import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, IconRenderer, MenuItem, Select, TagsInput, Tooltip } from '@/components/ui';
import type { DimensionFilter } from '../types/metric.types';

export interface DimensionFilterEditorProps
{
    value: DimensionFilter[];
    onChange: ( value: DimensionFilter[] ) => void;
    /** Dimension keys the source may write — the only keys a filter may reference. */
    allowedDimensionKeys: readonly string[];
    disabled?: boolean;
}

/** A new row matches the campaign key, which every source can carry. */
const NEW_FILTER: DimensionFilter = { target: 'campaignKey', operator: 'equals', values: [] };

/**
 * A row switched to campaign key drops its dimension key, and one switched to 'equals'
 * keeps only its first value, so the list never holds a shape the server refuses.
 */
function normalise( filter: DimensionFilter ): DimensionFilter
{
    const values = filter.operator === 'equals' ? filter.values.slice( 0, 1 ) : filter.values;

    return filter.target === 'campaignKey'
        ? { target: 'campaignKey', operator: filter.operator, values }
        : { ...filter, values };
}

export function DimensionFilterEditor( { value, onChange, allowedDimensionKeys, disabled }: DimensionFilterEditorProps )
{
    const { t } = useTranslation();

    const replace = ( index: number, next: Partial<DimensionFilter> ) =>
        onChange( value.map( ( filter, position ) => position === index ? normalise( { ...filter, ...next } ) : filter ) );

    const remove = ( index: number ) => onChange( value.filter( ( _filter, position ) => position !== index ) );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {value.map( ( filter, index ) => (
                <Box
                    key={index}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '140px 160px 120px minmax(0, 1fr) auto' },
                        gap: 1,
                        alignItems: 'center',
                    }}
                >
                    <Select
                        size="small"
                        value={filter.target}
                        disabled={disabled}
                        aria-label={t( 'forms.dimensionFilter.target' )}
                        onChange={event => replace( index, { target: event.target.value as DimensionFilter['target'] } )}
                    >
                        <MenuItem value="campaignKey">{t( 'forms.dimensionFilter.campaignKey' )}</MenuItem>
                        <MenuItem value="dimension" disabled={allowedDimensionKeys.length === 0}>
                            {t( 'forms.dimensionFilter.dimension' )}
                        </MenuItem>
                    </Select>

                    {filter.target === 'dimension'
                        ? (
                            <Select
                                size="small"
                                value={filter.dimensionKey ?? ''}
                                disabled={disabled}
                                displayEmpty
                                aria-label={t( 'forms.dimensionFilter.dimensionKey' )}
                                onChange={event => replace( index, { dimensionKey: String( event.target.value ) } )}
                            >
                                <MenuItem value="" disabled>{t( 'forms.dimensionFilter.dimensionKey' )}</MenuItem>
                                {allowedDimensionKeys.map( key => <MenuItem key={key} value={key}>{key}</MenuItem> )}
                            </Select>
                        )
                        : <Box />}

                    <Select
                        size="small"
                        value={filter.operator}
                        disabled={disabled}
                        aria-label={t( 'forms.dimensionFilter.operator' )}
                        onChange={event => replace( index, { operator: event.target.value as DimensionFilter['operator'] } )}
                    >
                        <MenuItem value="equals">{t( 'forms.dimensionFilter.equals' )}</MenuItem>
                        <MenuItem value="in">{t( 'forms.dimensionFilter.in' )}</MenuItem>
                    </Select>

                    <TagsInput
                        value={filter.values}
                        disabled={disabled}
                        placeholder={t( 'forms.dimensionFilter.values' )}
                        onChange={values => replace( index, { values } )}
                    />

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
            ) )}

            <Box>
                <Button
                    size="small"
                    variant="text"
                    disabled={disabled}
                    startIcon={<IconRenderer iconKey="plus" size={16} />}
                    onClick={() => onChange( [...value, NEW_FILTER] )}
                >
                    {t( 'forms.dimensionFilter.addFilter' )}
                </Button>
            </Box>
        </Box>
    );
}
