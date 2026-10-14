/**
 * PageAccount.tsx
 *
 * Account settings page — thin composition shell.
 * Composes Page + NavbarSidebarLayout with account section cards.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarSidebarLayout } from '@/components/container/NavbarSidebarLayout';
import { SidebarMenu } from '@/components/ui/navigation';
import { Typography, Stack } from '@/components/ui';
import { AccountOverviewSection } from '@/domains/account/pages/sections/AccountOverviewSection';
import { AccountAddressSection } from '@/domains/account/pages/sections/AccountAddressSection';
import { AccountMembersSection } from '@/domains/account/pages/sections/AccountMembersSection';
import { AccountBillingSection } from '@/domains/account/pages/sections/AccountBillingSection';
import { accountSettingsItems } from '@/config/menus/accountMenu';

export function PageAccount()
{
    const { t } = useTranslation();

    const sidebarItems = useMemo(
        () => accountSettingsItems.map( item => ( {
            ...item,
            label: t( item.label ),
        } ) ),
        [t]
    );

    return (
        <Page
            title={t( 'pages.accountSettings.title' )}
            description={t( 'pages.accountSettings.description' )}
        >
            <NavbarSidebarLayout
                sidebar={<SidebarMenu items={sidebarItems} />}
                mobileNav={<SidebarMenu items={sidebarItems} orientation="horizontal" />}
            >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    {t( 'pages.accountSettings.title' )}
                </Typography>
                <Stack spacing={3}>
                    <AccountOverviewSection />
                    <AccountAddressSection />
                    <AccountMembersSection />
                    <AccountBillingSection />
                </Stack>
            </NavbarSidebarLayout>
        </Page>
    );
}

export default PageAccount;
