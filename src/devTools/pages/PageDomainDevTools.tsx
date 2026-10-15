/**
 * Domain Playground
 *
 * One tab per domain. Each domain playground validates its model, form config,
 * dialogs and data shapes independently from any consumer page.
 */

import React from 'react';
import { Box, Tabs, Tab, Typography, Select, MenuItem } from '@/components/ui';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { LocationPlayground } from '../playgrounds/location/Location.playground';
import { AddressPlayground } from '../playgrounds/address/Address.playground';
import { LocationAddressPlayground } from '../playgrounds/locationAddress/LocationAddress.playground';
import { DimensionFilterEditorPlayground } from '../playgrounds/metric/DimensionFilterEditor.playground';

const PAGES = [
    { label: 'Location', component: <LocationPlayground /> },
    { label: 'Address', component: <AddressPlayground /> },
    { label: 'LocationAddress', component: <LocationAddressPlayground /> },
    { label: 'DimensionFilters', component: <DimensionFilterEditorPlayground /> },
];

export function PageDomainDevTools()
{
    const [tabIndex, setTabIndex] = React.useState( 0 );

    return (
        <NavbarLayout>
            <Box p={4}>
                <Typography variant="h3" gutterBottom>
                    Domain Playground
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
