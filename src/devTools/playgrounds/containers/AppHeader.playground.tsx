/**
 * AppHeader Playground
 *
 * The header row on its own — brand, page title, search, notifications,
 * account menu. Everything that is not a destination.
 *
 * The navigation rail has its own playground; this shows the other half of
 * the shell.
 */

import { useState } from 'react';
import { Box, Typography, Stack, Button } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { AppHeader } from '@/components/navbar/AppHeader';

export function PageAppHeaderPlayground()
{
    const [title, setTitle] = useState<string | undefined>( 'Inventory' );
    const [count, setCount] = useState( 3 );
    const [lastAction, setLastAction] = useState( '—' );

    return (
        <Page title="AppHeader Playground" description="Header row composition">
            <Box sx={{ p: 4, maxWidth: 1100 }}>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 84 }}>title:</Typography>
                    <Button variant={title ? 'contained' : 'outlined'} size="small" onClick={() => setTitle( 'Inventory' )}>set</Button>
                    <Button variant={!title ? 'contained' : 'outlined'} size="small" onClick={() => setTitle( undefined )}>none</Button>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 84 }}>unread:</Typography>
                    {[0, 3, 12].map( n => (
                        <Button key={n} variant={count === n ? 'contained' : 'outlined'} size="small" onClick={() => setCount( n )}>{n}</Button>
                    ) )}
                </Stack>

                <Box sx={{ border: 1, borderColor: 'border.base', borderRadius: 1, overflow: 'hidden' }}>
                    <AppHeader
                        title={title}
                        notificationCount={count}
                        onSearchClick={() => setLastAction( 'search' )}
                    />
                    <Box sx={{ p: 3, minHeight: 160 }}>
                        <Typography variant="body2" color="text.secondary">
                            Last action: {lastAction}
                        </Typography>
                    </Box>
                </Box>

            </Box>
        </Page>
    );
}
