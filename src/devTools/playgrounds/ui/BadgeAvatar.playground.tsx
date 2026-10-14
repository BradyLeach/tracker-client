import { Box, Stack } from '@/components/ui/layout';
import { Typography } from '@/components/ui/typography';
import { BadgeAvatar } from '@/components/ui/data-display';

export function PageBadgeAvatarPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                BadgeAvatar Playground
            </Typography>

            <Stack spacing={5} direction="row" mt={5}>
                <BadgeAvatar
                    avatarProps={{
                        src: '/user1.jpg',
                        alt: 'User One',
                        variant: 'rounded'
                    }}
                    badgeProps={{ badgeContent: 3, color: 'error' }}
                />

                <BadgeAvatar
                    avatarProps={{
                        src: '/user2.jpg',
                        alt: 'Barry',
                        sx: { bgcolor: 'secondary.main', color: 'common.white' },
                    }}
                    badgeProps={{
                        badgeContent: 1,
                        color: 'warning',
                        overlap: 'circular',
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                        },
                    }}
                />

                <BadgeAvatar
                    avatarProps={{ src: '/user3.jpg', alt: 'No Badge' }}
                />
            </Stack>
        </Box>
    );
}