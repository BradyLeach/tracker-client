import React from 'react';
import { Box, Tabs, Tab, Typography, Select, MenuItem } from '@/components/ui';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { PageBadgeAvatarPlayground } from '../playgrounds/ui/BadgeAvatar.playground';
import { PageIconButtonPlayground } from '../playgrounds/ui/IconButton.playground';
import { PageMenuPlayground } from '../playgrounds/ui/Menu.playground';
import { IconPickerPlayground } from '../playgrounds/ui/IconPicker.playground';
import { PageConfigMenuPlayground } from '../playgrounds/ui/ConfigMenu.playground';
import { PageSidebarMenuPlayground } from '../playgrounds/ui/SidebarMenu.playground';
import { CollectionToolbarPlayground } from '../playgrounds/ui/CollectionToolbar.playground';
import { CommentThreadPlayground } from '../playgrounds/ui/CommentThread.playground';
import { RichTextEditorPlayground } from '../playgrounds/ui/RichTextEditor.playground';
import { MapViewPlayground } from '../playgrounds/ui/MapView.playground';
import { LocationViewPlayground } from '../playgrounds/ui/LocationView.playground';
import { NotificationsModalPlayground } from '../playgrounds/communications/NotificationsModal.playground';
import { PageNavbarSidebarLayoutPlayground } from '../playgrounds/containers/NavbarSidebarLayout.playground';
import { DetailPanelHeaderPlayground } from '../playgrounds/containers/DetailPanelHeader.playground';
import { PageNavRailPlayground } from '../playgrounds/containers/NavRail.playground';
import { PageAppHeaderPlayground } from '../playgrounds/containers/AppHeader.playground';

const PAGES = [
    { label: 'Avatars', component: <PageBadgeAvatarPlayground /> },
    { label: 'IconButtons', component: <PageIconButtonPlayground /> },
    { label: 'Menus', component: <PageMenuPlayground /> },
    { label: 'IconPicker', component: <IconPickerPlayground /> },
    { label: 'ConfigMenu', component: <PageConfigMenuPlayground /> },
    { label: 'SidebarMenu', component: <PageSidebarMenuPlayground /> },
    { label: 'CollectionToolbar', component: <CollectionToolbarPlayground /> },
    { label: 'Comments', component: <CommentThreadPlayground /> },
    { label: 'RichText', component: <RichTextEditorPlayground /> },
    { label: 'Map', component: <MapViewPlayground /> },
    { label: 'Locations', component: <LocationViewPlayground /> },
    { label: 'Notifications', component: <NotificationsModalPlayground /> },
    { label: 'SidePanel', component: <PageNavbarSidebarLayoutPlayground /> },
    { label: 'DetailPanelHeader', component: <DetailPanelHeaderPlayground /> },
    { label: 'NavRail', component: <PageNavRailPlayground /> },
    { label: 'AppHeader', component: <PageAppHeaderPlayground /> },
];

export function PageMenuDevTools()
{
    const [tabIndex, setTabIndex] = React.useState( 0 );

    return (
        <NavbarLayout>
            <Box p={4}>
                <Typography variant="h3" gutterBottom>
                    📃 SaasyBits Menu Playground
                </Typography>

                {/* Mobile: select menu */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
                    <Select
                        fullWidth
                        size="small"
                        value={tabIndex}
                        onChange={( e ) => setTabIndex( Number( e.target.value ) )}
                    >
                        {PAGES.map( ( page, index ) => (
                            <MenuItem key={index} value={index}>
                                {page.label}
                            </MenuItem>
                        ) )}
                    </Select>
                </Box>

                {/* Desktop: tabs */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Tabs variant="scrollable" scrollButtons="auto" value={tabIndex} onChange={( _, i ) => setTabIndex( i )} sx={{ mb: 3 }}>
                        {PAGES.map( ( page, index ) => (
                            <Tab key={index} label={page.label} />
                        ) )}
                    </Tabs>
                </Box>

                <Box>{PAGES[tabIndex].component}</Box>
            </Box>
        </NavbarLayout>
    );
}
