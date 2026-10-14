// src/devtools/pages/dialogPlayground.tsx

import { useState } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { MessageDialog } from '@/components/ui/MessageDialog';

export function PageDialogPlayground() 
{
    const [openBasic, setOpenBasic] = useState( false );
    const [openConfirm, setOpenConfirm] = useState( false );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Dialog Playground
            </Typography>

            <Stack spacing={2} direction="row">
                <Button variant="outlined" onClick={() => setOpenBasic( true )}>
                    Open Basic Dialog
                </Button>

                <Button variant="contained" color="primary" onClick={() => setOpenConfirm( true )}>
                    Open Confirm Dialog
                </Button>
            </Stack>

            <MessageDialog
                open={openBasic}
                onClose={() => setOpenBasic( false )}
                title="Basic Message"
                actions={
                    <Button onClick={() => setOpenBasic( false )} autoFocus>
                        Close
                    </Button>
                }
            >
                <Typography>This is a simple dialog with one action button.</Typography>
            </MessageDialog>

            <MessageDialog
                open={openConfirm}
                onClose={() => setOpenConfirm( false )}
                title="Confirm Action"
                actions={
                    <>
                        <Button onClick={() => setOpenConfirm( false )} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={() => alert( 'Confirmed' )} variant="contained" color="primary" autoFocus>
                            Confirm
                        </Button>
                    </>
                }
                maxWidth="xs"
            >
                <Typography>Are you sure you want to perform this action?</Typography>
            </MessageDialog>
        </Box>
    );
}
