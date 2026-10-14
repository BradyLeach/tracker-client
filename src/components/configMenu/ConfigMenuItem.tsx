/**
 * MenuItem - Individual menu item component
 *
 * Renders icon, label, optional badge, and handles click.
 * Presentation-only. All UI primitives from @/components/ui only.
 */

import { Stack, MenuItem, Typography } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import type { ConfigMenuItemProps } from './configMenu.types';

/**
 * MenuItem component
 *
 * @param props - MenuItem props with item config and onClick handler
 * @returns Menu item component
 */
export function ConfigMenuItem( { item, onClick }: ConfigMenuItemProps )
{
    const handleClick = () =>
    {
        if( !item.disabled )
        {
            onClick( item );
        }
    };

    return (
        <MenuItem
            onClick={handleClick}
            disabled={item.disabled}
            sx={{
                py: 1.25,
                px: 2,
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                width="100%"
            >
                <IconRenderer iconKey={item.iconKey} size={20} />
                <Typography variant="body2">
                    {item.label}
                </Typography>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <Stack
                        component="span"
                        sx={{
                            ml: 'auto !important',
                            bgcolor: 'error.main',
                            color: 'white',
                            borderRadius: '12px',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            minWidth: '20px',
                            textAlign: 'center',
                        }}
                    >
                        {item.badgeCount}
                    </Stack>
                )}
            </Stack>
        </MenuItem>
    );
}
