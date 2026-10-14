import { useTranslation } from 'react-i18next';
import { Card, Stack, Typography, Chip } from '@/components/ui';
import type { Account } from '../types/account.types';

interface AccountCardProps {
    account: Account;
}

export function AccountCard( { account }: AccountCardProps )
{
    const { t } = useTranslation();

    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
                {account.label && (
                    <Typography variant="h6" fontWeight={600}>
                        {account.label}
                    </Typography>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                    {account.status && (
                        <Chip
                            label={t( `shared.status.${account.status}`, { defaultValue: account.status } )}
                            size="small"
                        />
                    )}
                    {account.accountType && (
                        <Chip
                            label={account.accountType.name}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}
