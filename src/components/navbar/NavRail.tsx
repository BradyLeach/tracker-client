/**
 * NavRail
 *
 * The rail's contents: navigation, and the theme toggle pinned to the foot.
 *
 * Deliberately nothing else. Brand, search, notifications and the account
 * menu all live in the header row, which keeps this a column of destinations
 * plus one system control — and removes any question of how a logo should
 * behave when the rail expands.
 *
 * A composition, not a primitive — both pieces have their own playgrounds.
 *
 * It does not own the panel around it. The caller wraps this in a SidePanel
 * and owns the open/size state, so the rail can be exercised without one.
 *
 * @example
 * ```tsx
 * <SidePanel side="left" open size={size} surface="rail">
 *     <NavRail items={items} variant={size} activeId={activeId} />
 * </SidePanel>
 * ```
 */

import { Box, Divider } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { ThemeToggle } from '@/components/navbar/ThemeToggle';
import { SidebarMenu, type SidebarMenuVariant } from '@/components/ui/navigation';
import type { SidebarNavItemConfig } from '@/components/configMenu';

export interface NavRailProps
{
    /** Navigation items. Same config the mobile menu is driven by. */
    items: SidebarNavItemConfig[];
    /** Matches the surrounding panel's size. Defaults to 'mini'. */
    variant?: SidebarMenuVariant;
    /** Item id to mark active, overriding the route match. */
    activeId?: string;
    onItemClick?: ( item: SidebarNavItemConfig ) => void;
    /**
     * Expand/collapse the rail. Omit to hide the control — the rail does not
     * own its own width, so with no handler there is nothing to toggle.
     */
    onToggleVariant?: () => void;
}

export function NavRail( { items, variant = 'mini', activeId, onItemClick, onToggleVariant }: NavRailProps )
{
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                // The menu region scrolls, not the rail: the foot stays put.
                overflow: 'hidden',
                py: 2,
                color: 'sidebar.text',
            }}
        >
            {/* Claims the space the foot controls do not, so destinations centre
                within what is free rather than the whole column. */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <SidebarMenu
                    items={items}
                    variant={variant}
                    surface="rail"
                    activeId={activeId}
                    onItemClick={onItemClick}
                />
            </Box>

            {/* System controls pinned to the foot, kept together rather than
                scattered between the rail and the header. */}
            <Box sx={{ flexShrink: 0, px: variant === 'mini' ? 0.75 : 1 }}>
                <Divider sx={{ borderColor: 'sidebar.activeBg', mb: 1 }} />

                <ThemeToggle variant={variant} />

                {onToggleVariant && (
                    <Box
                        component="button"
                        type="button"
                        onClick={onToggleVariant}
                        aria-label={variant === 'mini' ? 'Expand navigation' : 'Collapse navigation'}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: variant === 'mini' ? 'center' : 'flex-start',
                            gap: 1.5,
                            width: '100%',
                            py: 1,
                            px: variant === 'mini' ? 0 : 2,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'sidebar.text',
                            borderRadius: 0,
                            font: 'inherit',
                            '&:hover': { backgroundColor: 'sidebar.activeBg' },
                        }}
                    >
                        <IconRenderer iconKey={variant === 'mini' ? 'chevronRight' : 'chevronLeft'} size={21} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default NavRail;
