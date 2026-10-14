import { Box, Stack } from '@/components/ui/layout';
import { Typography } from '@/components/ui/typography';
import { IconButton, Tooltip } from '@/components/ui';
import { IconBell, IconHeart, IconStar } from '@tabler/icons-react';

export function PageIconButtonPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                IconButton Playground
            </Typography>

            {/* Color Variants */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Color Variants
                </Typography>
                <Stack spacing={2} direction="row" mt={2}>
                    <Tooltip title="Default">
                        <IconButton aria-label="default">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Primary">
                        <IconButton color="primary" aria-label="primary">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Secondary">
                        <IconButton color="secondary" aria-label="secondary">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Error">
                        <IconButton color="error" aria-label="error">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Warning">
                        <IconButton color="warning" aria-label="warning">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Success">
                        <IconButton color="success" aria-label="success">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Info">
                        <IconButton color="info" aria-label="info">
                            <IconBell width={18} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Size Variants */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Size Variants
                </Typography>
                <Stack spacing={2} direction="row" mt={2} alignItems="center">
                    <Tooltip title="Small">
                        <IconButton size="small" aria-label="small">
                            <IconHeart width={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Medium (default)">
                        <IconButton size="medium" aria-label="medium">
                            <IconHeart width={20} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Large">
                        <IconButton size="large" aria-label="large">
                            <IconHeart width={24} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Disabled State */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Disabled State
                </Typography>
                <Stack spacing={2} direction="row" mt={2}>
                    <IconButton disabled aria-label="disabled">
                        <IconStar width={18} />
                    </IconButton>
                    <IconButton color="primary" disabled aria-label="disabled-primary">
                        <IconStar width={18} />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
}
