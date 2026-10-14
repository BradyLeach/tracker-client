/**
 * ProfileMenuItem - Reusable menu item for ProfileMenu
 *
 * Renders a single menu item with icon, label, and consistent styling.
 * Used by ProfileMenu to render individual menu items with uniform padding and layout.
 */
import { Stack, MenuItem, Typography } from '@/components/ui';

/**
 * Configuration for a single menu item
 */
export interface ProfileMenuItemConfig
{
    /** Unique identifier for the item (used for React keys) */
    id: string;
    /** Icon component to display */
    icon: React.ReactNode;
    /** Label text to display */
    label: string;
    /** Click handler */
    onClick: () => void;
    /** Show divider before this item */
    showDividerBefore?: boolean;
}

/**
 * Props for ProfileMenuItem
 */
export interface ProfileMenuItemProps
{
    /** Icon component */
    icon: React.ReactNode;
    /** Label text */
    label: string;
    /** Click handler */
    onClick: () => void;
    /** Optional badge content (number or text) to display on the right */
    badgeContent?: React.ReactNode;
    /** Disable the menu item */
    disabled?: boolean;
    /** Render in danger/error style (e.g., for logout) */
    danger?: boolean;
}

/**
 * ProfileMenuItem component
 *
 * @param props - Component props
 * @returns Menu item component
 */
export function ProfileMenuItem( { icon, label, onClick, badgeContent, disabled, danger }: ProfileMenuItemProps )
{
    return (
        <MenuItem
            onClick={onClick}
            disabled={disabled}
            sx={{
                py: 1.25,
                px: 2,
                ...( danger && {
                    color: 'error.main',
                    '&:hover': {
                        backgroundColor: 'error.lighter',
                    }
                } )
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                {icon}
                <Typography variant="body2" color={danger ? 'error.main' : 'inherit'}>
                    {label}
                </Typography>
                {badgeContent && (
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
                        {badgeContent}
                    </Stack>
                )}
            </Stack>
        </MenuItem>
    );
}

export default ProfileMenuItem;
