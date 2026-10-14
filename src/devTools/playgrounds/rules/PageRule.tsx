import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import
{
    VerificationRulePlayground,
    LimitRulePlayground
} from '../..';

// import { FeatureRulePlayground } from './FeatureRulePlayground';

const RULE_PAGES = [
    { label: 'Verification', component: <VerificationRulePlayground /> },
    { label: 'Limit', component: <LimitRulePlayground /> },
    // { label: 'Feature', component: <FeatureRulePlayground /> },
];

export function PageRulePlayground()
{
    const [tab, setTab] = useState( 0 );

    return (
        <Box>
            <Typography variant="h4" mb={2}>
                🚨 Rule Playground
            </Typography>

            <Tabs value={tab} onChange={( _, v ) => setTab( v )} sx={{ mb: 2 }}>
                {RULE_PAGES.map( ( page, index ) => (
                    <Tab key={index} label={page.label} />
                ) )}
            </Tabs>

            <Box>{RULE_PAGES[tab].component}</Box>
        </Box>
    );
}
