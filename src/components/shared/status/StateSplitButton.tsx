/**
 * StateSplitButton
 *
 * Renders an interactive workflow state control as a split button.
 * Left section shows the current state label; right section is a
 * narrow chevron trigger that opens the transition menu.
 *
 * Only use this when the state is interactive (transitions available).
 * Use StatusChip for read-only state display.
 *
 * Usage:
 *   <StateSplitButton
 *       stateName={state?.name}
 *       stateCategoryColour={state?.stateCategory?.color}
 *       onClick={handleChipClick}
 *   />
 */

import { Box, Button } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { getStateChipSx } from '@/config/stateCategory.config';

export interface StateSplitButtonProps
{
    stateName: string | undefined;
    stateCategoryColour: string | undefined;
    onClick: ( event: React.MouseEvent<HTMLElement> ) => void;
    disabled?: boolean;
}

export function StateSplitButton( { stateName, stateCategoryColour, onClick, disabled }: StateSplitButtonProps )
{
    if( !stateName ) return null;

    const colourToken = stateCategoryColour || 'neutral';
    const chipSx = getStateChipSx( stateCategoryColour );

    const sharedButtonSx = {
        bgcolor: chipSx.bgcolor,
        color: chipSx.color,
        border: '1px solid',
        borderColor: chipSx.borderColor,
        fontSize: chipSx.fontSize,
        fontWeight: chipSx.fontWeight,
        letterSpacing: chipSx.letterSpacing,
        textTransform: chipSx.textTransform,
        height: chipSx.height,
        lineHeight: 1,
        minWidth: 'unset',
        padding: 0,
        transition: 'background-color 0.15s ease',
        '&:hover': {
            bgcolor: `${colourToken}.main`,
            borderColor: `${colourToken}.main`,
        },
        '&.Mui-disabled': {
            opacity: 0.5,
            bgcolor: chipSx.bgcolor,
            color: chipSx.color,
            borderColor: chipSx.borderColor,
        },
    };

    return (
        <Box sx={{ display: 'inline-flex' }}>
            <Button
                size="small"
                disabled={disabled}
                onClick={onClick}
                sx={{
                    ...sharedButtonSx,
                    px: 1,
                    borderRadius: '4px 0 0 4px',
                    borderRight: 'none',
                }}
            >
                {stateName}
            </Button>
            <Button
                size="small"
                disabled={disabled}
                onClick={onClick}
                sx={{
                    ...sharedButtonSx,
                    px: 0.75,
                    borderRadius: '0 4px 4px 0',
                }}
            >
                <IconRenderer iconKey="chevronDown" size={10} />
            </Button>
        </Box>
    );
}
