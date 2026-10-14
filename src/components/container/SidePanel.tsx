/**
 * SidePanel
 *
 * A panel anchored to the left or right edge of a layout. Owns side-panel
 * behaviour and nothing else — it knows nothing about navigation, routes or
 * whatever it contains. Its children are opaque.
 *
 * Fully controlled: the caller owns `open` and `size` and passes them down,
 * matching the pattern used everywhere else in this codebase. A panel never
 * decides its own state, so it stays trivially testable in isolation.
 *
 * Two shapes cover the real cases:
 *
 *   permanent + push     part of the flex row; content narrows beside it.
 *                        Used for the nav rail and the detail panel.
 *
 *   temporary + overlay  floats above content with a scrim, dismissible.
 *                        Used for the same panels on small screens.
 *
 * @example Nav rail — mini by default, caller holds the state
 * ```tsx
 * const [size, setSize] = useState<PanelSize>('mini');
 *
 * <SidePanel side="left" open size={size} surface="rail">
 *     <SidebarMenu items={items} variant={size} />
 * </SidePanel>
 * ```
 *
 * @example Detail panel — pushes the workspace, no scrim
 * ```tsx
 * <SidePanel side="right" open={!!selected} size="full" onClose={clear}>
 *     <InventoryDetail item={selected} />
 * </SidePanel>
 * ```
 */

import { type ReactNode } from 'react';
import { Box, Drawer } from '@/components/ui';

/** Collapsed rail vs expanded panel. */
export type PanelSize = 'mini' | 'full';

/** Whether the panel occupies layout space or floats above it. */
export type PanelMode = 'permanent' | 'temporary';

/** Whether the panel displaces sibling content or covers it. */
export type PanelDisplay = 'push' | 'overlay';

export interface SidePanelProps
{
    /** Edge the panel is anchored to. */
    side: 'left' | 'right';
    /** Visible or not. Caller owns this. */
    open: boolean;
    /** Collapsed rail or expanded panel. Defaults to 'full'. */
    size?: PanelSize;
    /** Occupies layout space, or floats above it. Defaults to 'permanent'. */
    mode?: PanelMode;
    /** Displaces sibling content, or covers it. Defaults to 'push'. */
    display?: PanelDisplay;
    /** Width when size is 'mini'. */
    miniWidth?: number;
    /**
     * Width when size is 'full'. Accepts a CSS length so an overlay can clamp
     * itself to the screen, e.g. 'min(420px, 100%)'.
     */
    fullWidth?: number | string;
    /** Dismiss handler. Required for temporary panels, ignored otherwise. */
    onClose?: () => void;
    /**
     * Which surface the panel paints.
     * 'paper' sits with the page; 'rail' is the near-black navigation ground
     * that stays constant across light and dark.
     */
    surface?: 'paper' | 'rail';
    /** Panel contents. Opaque to this component. */
    children: ReactNode;
}

const DEFAULT_MINI_WIDTH = 76;
const DEFAULT_FULL_WIDTH = 280;

export function SidePanel( {
    side,
    open,
    size = 'full',
    mode = 'permanent',
    display = 'push',
    miniWidth = DEFAULT_MINI_WIDTH,
    fullWidth = DEFAULT_FULL_WIDTH,
    onClose,
    surface = 'paper',
    children,
}: SidePanelProps )
{
    const width = size === 'mini' ? miniWidth : fullWidth;

    const surfaceSx = surface === 'rail'
        ? { backgroundColor: 'sidebar.bg', color: 'sidebar.text' }
        : { backgroundColor: 'background.paper' };

    const edgeSx = side === 'left'
        ? { borderRight: '1px solid', borderColor: 'border.base' }
        : { borderLeft: '1px solid', borderColor: 'border.base' };

    // Temporary panels are overlays by definition — hand off to the ui Drawer,
    // which brings the scrim, focus trap and escape handling with it.
    if( mode === 'temporary' )
    {
        return (
            <Drawer
                anchor={side}
                open={open}
                onClose={onClose}
                slotProps={{
                    paper: {
                        sx: {
                            width,
                            backgroundImage: 'none',
                            ...surfaceSx,
                        },
                    },
                }}
            >
                {children}
            </Drawer>
        );
    }

    return (
        <Box
            sx={{
                // Width is the transition, not transform — a pushing panel has
                // to change the space it occupies, not slide over it.
                width: open ? width : 0,
                flexShrink: 0,
                overflow: 'hidden',
                transition: ( theme ) => theme.transitions.create( 'width', {
                    duration: theme.transitions.duration.shorter,
                } ),
                ...( display === 'overlay' && {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    [side]: 0,
                    zIndex: 2,
                } ),
                ...( open && edgeSx ),
                ...surfaceSx,
            }}
        >
            {/* Fixed inner width stops contents reflowing while the panel animates. */}
            <Box sx={{ width, height: '100%', overflowY: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
}

export default SidePanel;
