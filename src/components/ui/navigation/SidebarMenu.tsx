/**
 * SidebarMenu
 *
 * Renders a config-driven list of navigation items. Knows nothing about the
 * container it sits in — pass `variant` to switch presentation, don't let it
 * infer anything from its surroundings.
 *
 * orientation:
 *   vertical    stacked list, for a rail or panel
 *   horizontal  scrollable tabs, for small screens
 *
 * variant (vertical only):
 *   full  icon and label on one row, for an expanded panel
 *   mini  icon above a small label, centred, for a collapsed rail
 *
 * surface:
 *   panel  inherits page text colours
 *   rail   the near-black navigation ground, where the active item is
 *          white-on-white-alpha with a neutral stripe
 *
 * Both are caller-controlled. A mini menu renders identically with or without
 * a SidePanel around it, which is what keeps it testable on its own.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SidebarNavItemConfig } from '@/components/configMenu';
import { List } from '@/components/ui/navigation/List';
import { Tabs } from '@/components/ui/navigation/Tabs';
import { Tab } from '@/components/ui/navigation/Tab';
import { ListItemButton } from '@/components/ui/navigation/ListItemButton';
import { Stack } from '@/components/ui/layout/Stack';
import { Typography } from '@/components/ui/typography/Typography';
import { Divider } from '@/components/ui/layout/Divider';
import { IconRenderer } from '@/components/ui/icons/Icon';

export type SidebarMenuOrientation = 'vertical' | 'horizontal';
export type SidebarMenuVariant = 'full' | 'mini';
export type SidebarMenuSurface = 'panel' | 'rail';

interface SidebarMenuProps {
    items: SidebarNavItemConfig[];
    /** Layout direction. Defaults to 'vertical'. */
    orientation?: SidebarMenuOrientation;
    /** Presentation. Defaults to 'full'. */
    variant?: SidebarMenuVariant;
    /** Which ground the menu is painted on. Defaults to 'panel'. */
    surface?: SidebarMenuSurface;
    /**
     * Item id to mark active, overriding the route match.
     * Lets the active state be driven directly rather than by navigation.
     */
    activeId?: string;
    onItemClick?: ( item: SidebarNavItemConfig ) => void;
}

export function SidebarMenu( {
    items,
    orientation = 'vertical',
    variant = 'full',
    surface = 'panel',
    activeId,
    onItemClick,
}: SidebarMenuProps )
{
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = ( item: SidebarNavItemConfig ) =>
    {
        if( activeId !== undefined ) return item.id === activeId;

        const current = location.pathname.replace( /\/+$/, '' );
        const target = item.path.replace( /\/+$/, '' );
        return current === target || current.startsWith( target + '/' );
    };

    const activeItem = items.find( isActive );

    if( orientation === 'horizontal' )
    {
        return (
            <Tabs
                value={activeItem?.path ?? false}
                onChange={( _, next: string ) =>
                {
                    const item = items.find( i => i.path === next );
                    navigate( next );
                    if( item ) onItemClick?.( item );
                }}
                variant="scrollable"
                scrollButtons="auto"
            >
                {items.map( item => (
                    <Tab key={item.id} label={t( item.label )} value={item.path} disabled={item.disabled} />
                ) )}
            </Tabs>
        );
    }

    const isMini = variant === 'mini';
    const isRail = surface === 'rail';

    const activeColor = isRail ? '#fff' : 'text.primary';
    const restColor = isRail ? 'sidebar.text' : 'text.secondary';

    return (
        <List disablePadding>
            {items.map( ( item ) =>
            {
                const active = isActive( item );

                return (
                    <React.Fragment key={item.id}>
                        {item.showDividerBefore && (
                            <Divider component="li" sx={isRail ? { borderColor: 'sidebar.activeBg' } : undefined} />
                        )}
                        <ListItemButton
                            disabled={item.disabled}
                            selected={active}
                            onClick={() => { navigate( item.path ); onItemClick?.( item ); }}
                            sx={{
                                // Set once here; the icon inherits via
                                // currentColor and the label via 'inherit'.
                                color: active ? activeColor : restColor,
                                position: 'relative',
                                borderRadius: isRail ? 0 : undefined,
                                ...( isMini && {
                                    flexDirection: 'column',
                                    gap: 0.6,
                                    py: 1,
                                    px: 0,
                                } ),
                                // Active marker is an inset stripe, not a full-height
                                // border — it reads as a marker beside the item rather
                                // than an edge on the container.
                                '&.Mui-selected::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 8,
                                    bottom: 8,
                                    width: 3,
                                    borderRadius: '0 2px 2px 0',
                                    backgroundColor: isRail ? 'sidebar.activeBorder' : 'graphite',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: isRail ? 'sidebar.activeBg' : 'selected.bg',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: isRail ? 'sidebar.activeBg' : 'action.hover',
                                },
                                ...( isRail && {
                                    '&:hover': { backgroundColor: 'sidebar.activeBg' },
                                } ),
                            }}
                        >
                            {isMini ? (
                                <>
                                    <IconRenderer iconKey={item.iconKey} size={21} />
                                    <Typography
                                        sx={{
                                            fontSize: 9,
                                            fontWeight: 500,
                                            letterSpacing: '0.01em',
                                            lineHeight: 1.2,
                                            textAlign: 'center',
                                            color: 'inherit',
                                        }}
                                    >
                                        {t( item.label )}
                                    </Typography>
                                </>
                            ) : (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <IconRenderer iconKey={item.iconKey} size={21} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'inherit',
                                            fontWeight: active ? 600 : 400,
                                        }}
                                    >
                                        {t( item.label )}
                                    </Typography>
                                </Stack>
                            )}
                        </ListItemButton>
                    </React.Fragment>
                );
            } )}
        </List>
    );
}
