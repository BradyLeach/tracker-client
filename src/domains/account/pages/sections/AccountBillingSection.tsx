import { useTranslation } from 'react-i18next';
import { Typography, Card } from '@/components/ui';

export function AccountBillingSection()
{
    const { t } = useTranslation();

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t( 'pages.accountSettings.sections.billing' )}
            </Typography>
            <Typography color="text.secondary">
                {t( 'pages.accountSettings.billing.placeholder' )}
            </Typography>
        </Card>
    );
}

export default AccountBillingSection;
