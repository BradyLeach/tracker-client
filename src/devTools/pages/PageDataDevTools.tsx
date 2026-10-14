import React from 'react';
import { Box, Tabs, Tab, Typography, Select, MenuItem } from '@/components/ui';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { PagePing } from '../playgrounds/api/PingTest.playground';
import { PageFormPlayground } from '../playgrounds/forms/FormScaffold.playground';
import { PageRulePlayground } from '../playgrounds/rules/PageRule';
import { CollectionViewPlayground } from '../playgrounds/collection/CollectionView.playground';
import { DataTablePlayground } from '../playgrounds/tables/DataTable.playground';
import { GroupedDataTablePlayground } from '../playgrounds/tables/GroupedDataTable.playground';
import { CountMetricPlayground } from '../playgrounds/ui/CountMetric.playground';

const PAGES = [
    { label: 'Ping Test', component: <PagePing /> },
    { label: 'Forms', component: <PageFormPlayground /> },
    { label: 'Rule', component: <PageRulePlayground /> },
    { label: 'CollectionView', component: <CollectionViewPlayground /> },
    { label: 'DataTable', component: <DataTablePlayground /> },
    { label: 'GroupedDataTable', component: <GroupedDataTablePlayground /> },
    { label: 'CountMetric', component: <CountMetricPlayground /> },
];

export function PageDataDevTools()
{
    const [tabIndex, setTabIndex] = React.useState( 0 );

    return (
        <NavbarLayout>
            <Box p={4}>
                <Typography variant="h3" gutterBottom>
                    📊 SaasyBits Data Playground
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
