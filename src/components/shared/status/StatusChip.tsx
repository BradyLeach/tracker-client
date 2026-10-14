/**
 * StatusChip
 *
 * Renders the workflow state of a single record as a styled chip.
 * Resolves the state name and colour category from the state registry.
 *
 * Usage:
 *   <StatusChip stateGraphStateId={partnership.currentStateGraphStateId} />
 */

import { Chip, type ChipProps } from '@/components/ui/data-display/Chip';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { getStateChipSx } from '@/config/stateCategory.config';

export interface StatusChipProps extends Omit<ChipProps, 'children'>
{
    stateName: string | undefined;
    stateCategoryColour: string | undefined;
}

export function StatusChip( { stateName, stateCategoryColour, ...chipProps }: StatusChipProps )
{
    if( !stateName ) return null;

    const isInteractive = !!chipProps.onClick;
    const chipSx = getStateChipSx( stateCategoryColour );

    const label = isInteractive ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {stateName}
            <IconRenderer iconKey="chevronDown" size={10} />
        </span>
    ) : stateName;

    return (
        <Chip
            label={label}
            variant="filled"
            size="small"
            sx={{
                // A chip is content-sized. Without this it is blockified and
                // stretched by any flex or grid parent — a column-direction
                // Box will pull it to the full container width.
                width: 'fit-content',
                alignSelf: 'flex-start',
                ...( isInteractive ? { maxWidth: 124 } : {} ),
                cursor: isInteractive ? 'pointer' : 'default',
                ...chipSx
            }}
            {...chipProps}
        />
    );
}
