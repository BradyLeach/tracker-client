/**
 * Menu action dispatcher - Pure function that handles menu actions
 *
 * Decoupled from UI logic. Accepts handlers as parameters.
 */
import { ConfigMenuActionTypes } from './configMenu.types';
import type { MenuItemConfig, ConfigMenuActionHandlers } from './configMenu.types';

/**
 * Dispatcher for menu actions
 * Pure function - no side effects, all behavior delegated to handlers
 */
export function dispatchMenuAction(
    item: MenuItemConfig,
    handlers: ConfigMenuActionHandlers
): void
{
    const value = item.actionValue || item.id;

    switch ( item.actionType )
    {
        case ConfigMenuActionTypes.OPEN_MODAL:
            if( value && handlers.onOpenModal )
            {
                handlers.onOpenModal( value );
            }
            break;

        case ConfigMenuActionTypes.NAVIGATE_TO:
            if( value && handlers.onNavigate )
            {
                handlers.onNavigate( value );
            }
            break;

        case ConfigMenuActionTypes.LOGOUT:
            if( handlers.onLogout )
            {
                handlers.onLogout();
            }
            break;

        default:
            console.warn( `[dispatchMenuAction] Unknown action type: ${item.actionType}` );
    }
}
