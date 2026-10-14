import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, Stack, Skeleton, Chip, Avatar } from '@/components/ui';
import { useCurrentAccount, useMemberships } from '@/domains/account/account';

export function AccountMembersSection()
{
    const { t } = useTranslation();
    const { data: account, isLoading: accountLoading, isError: accountError } = useCurrentAccount();
    const { data: memberships, isLoading: membersLoading, isError: membersError } = useMemberships( account?.id ?? null );

    const isLoading = accountLoading || membersLoading;
    const isError = accountError || membersError;

    if( isLoading )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Stack gap={2}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                </Stack>
            </Card>
        );
    }

    if( isError )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Typography color="error">
                    {t( 'messages.error.loadFailed' )}
                </Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t( 'pages.accountSettings.sections.members' )}
            </Typography>
            <Stack spacing={2}>
                {( !memberships || memberships.length === 0 ) && (
                    <Typography color="text.secondary">
                        {t( 'messages.info.noMembersFound' )}
                    </Typography>
                )}
                {memberships?.map( ( membership ) => (
                    <Box
                        key={membership.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Avatar
                            src={membership.profile?.avatarURL}
                            alt={membership.profile?.name}
                            sx={{ width: 40, height: 40 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                                {membership.profile?.name ?? membership.memberId}
                            </Typography>
                            {membership.profile?.handle && (
                                <Typography variant="body2" color="text.secondary">
                                    @{membership.profile.handle}
                                </Typography>
                            )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Chip
                                label={membership.memberType}
                                size="small"
                                color={membership.memberType === 'owner' ? 'primary' : 'default'}
                            />
                            {membership.status && (
                                <Chip label={membership.status} size="small" variant="outlined" />
                            )}
                        </Stack>
                    </Box>
                ) )}
            </Stack>
        </Card>
    );
}

export default AccountMembersSection;
