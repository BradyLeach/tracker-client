/**
 * MenuRow - App UI component for a menu row that is not an option
 *
 * A section heading or a caller's slot (a search field, a switch) inside a Menu.
 * The menu's keyboard navigation and initial focus skip it, and key events stop
 * at its edge, so typing into a field in it is not taken as menu type-ahead.
 *
 * The skip is MUI's `muiSkipListHighlight` contract. It lives here, in the
 * wrapper layer, so nothing above knows the menu is MUI's.
 *
 * @example
 * ```tsx
 * <Menu anchorEl={anchor} open={!!anchor} onClose={close}>
 *     <MenuRow heading><Typography variant="caption">Status</Typography></MenuRow>
 *     <MenuItem onClick={toggle}>Active only</MenuItem>
 * </Menu>
 * ```
 */
import type { KeyboardEvent, ReactNode } from 'react';
import { Box } from '../layout';

export interface MenuRowProps
{
    children: ReactNode;
    /** A heading sits close to the options it names; a slot is padded evenly. */
    heading?: boolean;
}

export function MenuRow( { children, heading = false }: MenuRowProps )
{
    return (
        <Box
            sx={heading ? { px: 2, pt: 1.5, pb: 0.5 } : { px: 2, py: 0.5 }}
            onKeyDown={( event: KeyboardEvent ) => event.stopPropagation()}
        >
            {children}
        </Box>
    );
}
MenuRow.muiSkipListHighlight = true;

export default MenuRow;
