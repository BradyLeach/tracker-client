import React from 'react';
import { Menu, Divider } from '@/components/ui';
import { ConfigMenuItem } from './ConfigMenuItem';
import type { ConfigMenuProps, MenuItemConfig } from './configMenu.types';

export function ConfigMenu( { items, anchorEl, open, onClose, onAction }: ConfigMenuProps )
{
    const handleItemClick = ( item: MenuItemConfig ) =>
    {
        onAction?.( item );
        onClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                paper: {
                    sx: { mt: 1.5, minWidth: 200 },
                    onKeyDown: ( e: React.KeyboardEvent ) =>
                    {
                        if( e.key === 'Escape' ) onClose();
                    },
                },
            }}
        >
            {items.map( ( item ) => (
                <div key={`menu-${item.id}`}>
                    {item.showDividerBefore && <Divider sx={{ my: 0.5 }} />}
                    <ConfigMenuItem item={item} onClick={handleItemClick} />
                </div>
            ) )}
        </Menu>
    );
}
