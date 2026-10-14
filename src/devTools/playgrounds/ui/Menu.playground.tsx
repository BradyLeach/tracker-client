import { useState } from 'react';
import { Box, Stack } from '@/components/ui/layout';
import { Typography } from '@/components/ui/typography';
import { Button, Menu, MenuItem, Divider, IconButton } from '@/components/ui';
import { IconDotsVertical } from '@tabler/icons-react';

export function PageMenuPlayground()
{
    const [anchorEl1, setAnchorEl1] = useState<null | HTMLElement>( null );
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>( null );
    const [selectedIndex, setSelectedIndex] = useState( 1 );

    const handleClick1 = ( event: React.MouseEvent<HTMLElement> ) =>
    {
        setAnchorEl1( event.currentTarget );
    };

    const handleClose1 = () =>
    {
        setAnchorEl1( null );
    };

    const handleClick2 = ( event: React.MouseEvent<HTMLElement> ) =>
    {
        setAnchorEl2( event.currentTarget );
    };

    const handleClose2 = () =>
    {
        setAnchorEl2( null );
    };

    const handleMenuItemClick = ( index: number ) =>
    {
        setSelectedIndex( index );
        handleClose2();
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Menu Playground
            </Typography>

            <Stack spacing={4} mt={4}>
                {/* Basic Menu */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Basic Menu
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleClick1}
                        aria-controls={anchorEl1 ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={anchorEl1 ? 'true' : undefined}
                    >
                        Open Menu
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl1}
                        open={Boolean( anchorEl1 )}
                        onClose={handleClose1}
                    >
                        <MenuItem onClick={handleClose1}>Profile</MenuItem>
                        <MenuItem onClick={handleClose1}>My Account</MenuItem>
                        <MenuItem onClick={handleClose1}>Logout</MenuItem>
                    </Menu>
                </Box>

                {/* Menu with Divider and Selection */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Menu with Divider & Selection
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Selected: Option {selectedIndex + 1}
                    </Typography>
                    <IconButton
                        onClick={handleClick2}
                        aria-controls={anchorEl2 ? 'selection-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={anchorEl2 ? 'true' : undefined}
                    >
                        <IconDotsVertical width={20} />
                    </IconButton>
                    <Menu
                        id="selection-menu"
                        anchorEl={anchorEl2}
                        open={Boolean( anchorEl2 )}
                        onClose={handleClose2}
                    >
                        <MenuItem
                            selected={selectedIndex === 0}
                            onClick={() => handleMenuItemClick( 0 )}
                        >
                            Option 1
                        </MenuItem>
                        <MenuItem
                            selected={selectedIndex === 1}
                            onClick={() => handleMenuItemClick( 1 )}
                        >
                            Option 2
                        </MenuItem>
                        <MenuItem
                            selected={selectedIndex === 2}
                            onClick={() => handleMenuItemClick( 2 )}
                        >
                            Option 3
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleClose2}>More Options</MenuItem>
                    </Menu>
                </Box>
            </Stack>
        </Box>
    );
}
