/**
 * NavbarScaffold - Slot-based navbar component
 *
 * Provides a consistent, extensible navbar layout following Modernize's Header pattern.
 * Uses compound component pattern (similar to FormScaffold) with slots for flexible composition.
 *
 * Slots:
 * - Brand: Logo and app branding (left side)
 * - Search: Search icon/button (after brand)
 * - Actions: Right-aligned actions (notifications, profile, etc.)
 *
 * Mobile-first responsive design with sticky positioning and theme integration.
 *
 * @component
 * @example
 * ```tsx
 * <NavbarScaffold>
 *   <NavbarScaffold.Brand>
 *     <Logo />
 *   </NavbarScaffold.Brand>
 *   <NavbarScaffold.Search>
 *     <SearchButton />
 *   </NavbarScaffold.Search>
 *   <NavbarScaffold.Actions>
 *     <NotificationIcon />
 *     <ProfileMenu />
 *   </NavbarScaffold.Actions>
 * </NavbarScaffold>
 * ```
 */
import { type ReactNode } from 'react';
import { Box, Stack, Grid, AppBar, Toolbar } from '@/components/ui';

/** Navbar height. Matches the design's header band. */
const TOPBAR_HEIGHT = 56;

/**
 * Props for NavbarScaffold
 */
interface NavbarScaffoldProps
{
    /** Child slots (Brand, Search, Actions) */
    children: ReactNode;
}

/**
 * Props for slot components
 */
interface SlotProps
{
    /** Slot content */
    children: ReactNode;
}

/**
 * Brand slot - Logo and branding (left side)
 */
function Brand( { children }: SlotProps )
{
    return <Box sx={{ display: 'flex', alignItems: 'center' }}>{children}</Box>;
}

/**
 * Title slot - Page title (after brand)
 *
 * No left margin: spacing is a `gap` on the container, so a title with no
 * brand beside it still starts at the content's left edge.
 */
function Title( { children }: SlotProps )
{
    return <Box sx={{ display: 'flex', alignItems: 'center' }}>{children}</Box>;
}

/**
 * Search slot - Search field, grouped with the actions on the right.
 * The design puts search beside the account controls, not beside the brand.
 */
function Search( { children }: SlotProps )
{
    return <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>{children}</Box>;
}

/**
 * Nav slot - Primary navigation links (desktop only, hidden on mobile).
 * Sits between Brand/Search and the spacer.
 */
function Nav( { children }: SlotProps )
{
    return (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {children}
        </Box>
    );
}

/**
 * Actions slot - Right-aligned action buttons (notifications, profile, etc.)
 * Uses Stack for consistent spacing between items, flush to the right edge
 */
function Actions( { children }: SlotProps )
{
    return (
        <Stack spacing={1} direction="row" alignItems="center" marginRight={1}>
            {children}
        </Stack>
    );
}

/**
 * NavbarScaffold - Main component
 *
 * Renders sticky navbar with slot-based layout using Grid:
 * - Column 1: Brand + Search (left, auto width)
 * - Column 2: Spacer (grows to fill space)
 * - Column 3: Actions (right, auto width)
 *
 * @param props - Component props
 * @returns Navbar scaffold component
 */
function NavbarScaffold( { children }: NavbarScaffoldProps )
{
    // Identify each slot from children
    const childArray = Array.isArray( children ) ? children : [children];
    const brandChild = childArray.find( ( child: any ) => child?.type === Brand );
    const titleChild = childArray.find( ( child: any ) => child?.type === Title );
    const searchChild = childArray.find( ( child: any ) => child?.type === Search );
    const navChild = childArray.find( ( child: any ) => child?.type === Nav );
    const actionsChild = childArray.find( ( child: any ) => child?.type === Actions );

    return (
        <AppBar
            position="sticky"
            color="default"
            sx={{
                // The header shares the content's surface and is separated by a
                // rule, not a shadow or a tonal step — the design treats them as
                // one column.
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'border.strong',
                background: ( theme ) => theme.palette.background.default,
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                // Unqualified by breakpoint: scoping to lg left smaller
                // screens on Toolbar's default height.
                height: TOPBAR_HEIGHT,
                minHeight: TOPBAR_HEIGHT,
                flexShrink: 0,
                width: '100%',
            }}
        >
            <Toolbar
                disableGutters
                variant="dense"
                sx={{
                    width: '100%',
                    minHeight: TOPBAR_HEIGHT,
                    color: ( theme ) => theme.palette.text.secondary,
                }}
            >
                <Grid container width="100%" alignItems="center">
                    {/* Left: Brand + Title + Nav */}
                    <Grid size="auto">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, pl: { xs: 2, sm: 3 } }}>
                            {brandChild}
                            {titleChild}
                            {navChild}
                        </Box>
                    </Grid>

                    {/* Spacer: Takes remaining space */}
                    <Grid size="grow" />

                    {/* Right: Search + Actions */}
                    <Grid size="auto">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: { xs: 1, sm: 2 } }}>
                            {searchChild}
                            {actionsChild}
                        </Box>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}

/**
 * Compound component exports
 * Allows slot-based composition: <NavbarScaffold.Brand>, <NavbarScaffold.Search>, etc.
 */
NavbarScaffold.Brand = Brand;
NavbarScaffold.Title = Title;
NavbarScaffold.Search = Search;
NavbarScaffold.Nav = Nav;
NavbarScaffold.Actions = Actions;

export { NavbarScaffold };
export default NavbarScaffold;
