import { useTranslation } from 'react-i18next';
import { Typography, Card, Stack, Skeleton } from '@/components/ui';
import { useCurrentAccount } from '@/domains/account/account';
import { AccountCard } from '@/domains/account/account/components/AccountCard';

export function AccountOverviewSection()
{
    const { t } = useTranslation();
    const { data: account, isLoading, isError } = useCurrentAccount();

    if( isLoading )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Stack gap={2}>
                    <Skeleton variant="rounded" height={32} />
                    <Skeleton variant="rounded" height={32} />
                </Stack>
            </Card>
        );
    }

    if( isError || !account )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Typography color="error">
                    {t( 'messages.error.loadFailed' )}
                </Typography>
            </Card>
        );
    }

    return <AccountCard account={account} />;
}

export default AccountOverviewSection;
