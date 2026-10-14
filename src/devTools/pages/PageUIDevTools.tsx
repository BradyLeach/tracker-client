import React from 'react';
import { Box, Tabs, Tab, Typography, Select, MenuItem } from '@/components/ui';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { PageDialogPlayground } from '../playgrounds/ui/Dialog.playground';
import { TablePlayground } from '../playgrounds/ui/Table.playground';
import { RatingPlayground } from '../playgrounds/ui/Rating.playground';
import { StatusChipPlayground } from '../playgrounds/ui/StatusChip.playground';
import { RecordCardPlayground } from '../playgrounds/ui/RecordCard.playground';
import { EmptyStatePlayground } from '../playgrounds/ui/EmptyState.playground';
import { RealtimeTracePlayground } from '../playgrounds/ui/RealtimeTrace.playground';
import { PageSvgCanvasPlayground } from '../playgrounds/svgCanvas/SvgCanvas.playground';
import { StateGraphViewerPlayground } from '../playgrounds/workflow/StateGraphViewer.playground';

const PAGES = [
    { label: 'Dialogs', component: <PageDialogPlayground /> },
    { label: 'Table', component: <TablePlayground /> },
    { label: 'Rating', component: <RatingPlayground /> },
    { label: 'StatusChip', component: <StatusChipPlayground /> },
    { label: 'RecordCard', component: <RecordCardPlayground /> },
    { label: 'EmptyState', component: <EmptyStatePlayground /> },
    { label: 'Realtime trace', component: <RealtimeTracePlayground /> },
    { label: 'SvgCanvas', component: <PageSvgCanvasPlayground /> },
    { label: 'StateGraphViewer', component: <StateGraphViewerPlayground /> },
];

export function PageUIDevTools()
{
    const [tabIndex, setTabIndex] = React.useState( 0 );

    return (
        <NavbarLayout>
            <Box p={4}>
                <Typography variant="h3" gutterBottom>
                    🎨 SaasyBits UI Playground
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
