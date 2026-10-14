/**
 * ResponsiveButton - App UI composition
 *
 * A button that always shows its icon and drops its label on narrow screens,
 * collapsing to a square target. One component so every toolbar and page
 * action collapses at the same width and in the same way.
 *
 * It stays a single Button across the breakpoint rather than swapping to an
 * IconButton — swapping would remount the control and drop focus mid-interaction,
 * and the two carry different variant styling.
 *
 * The label is always the accessible name, so the collapsed form is still
 * announced. Callers pass translated text; this component does not translate.
 *
 * Behaviour is the caller's: `onClick` for actions and modals, or `component`
 * for navigation, exactly as MUI's Button allows.
 *
 * @example
 * ```tsx
 * <ResponsiveButton iconKey="plus" label="Add Partner" variant="outlined" onClick={open} />
 *
 * <ResponsiveButton iconKey="building" label="Partners" component={RouterLink} to="/partnerships" />
 * ```
 */

import type { ReactNode } from 'react';
import { Box } from '@/components/ui/layout';
import { IconRenderer } from '@/components/ui/icons/Icon';
import type { IconKey } from '@/config/icons.config';
import CustomButton from '@/theme/theme-elements/inputs/CustomButton';
import type { ButtonProps } from '@mui/material';

export interface ResponsiveButtonProps
     
    extends Omit<ButtonProps<any>, 'startIcon' | 'endIcon' | 'children'>
{
    /** Always visible. */
    iconKey: IconKey;
    /** Shown from `collapseBelow` up; the accessible name at every width. */
    label: string;
    /** Width at which the label appears. Defaults to 'sm'. */
    collapseBelow?: 'sm' | 'md' | 'lg';
    /** Trailing adornment, e.g. a chevron. Hidden with the label. */
    trailing?: ReactNode;
    /** Icon size in px. */
    iconSize?: number;
    /** Theme colour for the icon alone, e.g. 'primary.main'. The label keeps the button's colour. */
    iconColor?: string;
}

export function ResponsiveButton( {
    iconKey,
    label,
    collapseBelow = 'sm',
    trailing,
    iconSize = 16,
    iconColor,
    sx,
    ...buttonProps
}: ResponsiveButtonProps )
{
    return (
        <CustomButton
            aria-label={label}
            sx={{
                // Square while collapsed, natural width once the label shows.
                minWidth: { xs: 36, [collapseBelow]: 'auto' },
                px: { xs: 0, [collapseBelow]: 1.5 },
                gap: { xs: 0, [collapseBelow]: 1 },
                ...sx,
            }}
            {...buttonProps}
        >
            {/* The icon draws in currentColor, so the colour is set on its wrapper. */}
            <Box component="span" sx={{ display: 'inline-flex', color: iconColor }}>
                <IconRenderer iconKey={iconKey} size={iconSize} />
            </Box>

            <Box
                component="span"
                sx={{
                    display: { xs: 'none', [collapseBelow]: 'inline-flex' },
                    alignItems: 'center',
                    gap: 0.5,
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
                {trailing}
            </Box>
        </CustomButton>
    );
}

export default ResponsiveButton;
