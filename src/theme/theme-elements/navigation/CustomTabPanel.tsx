
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export interface CustomTabPanelProps
{
    children?: ReactNode;
    value: number;
    index: number;
}

/**
 * CustomTabPanel - Theme-element for tab content panels
 *
 * Provides accessible show/hide logic for tab content.
 * No MUI core TabPanel exists — this fills that gap at the theme layer.
 */
const CustomTabPanel = ( { children, value, index }: CustomTabPanelProps ) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
    >
        {value === index && <Box>{children}</Box>}
    </div>
);

export default CustomTabPanel;
