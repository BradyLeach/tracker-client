/**
 * PageAccountSettings.tsx
 *
 * Account settings page — thin composition shell.
 * Composes Page + NavbarSidebarLayout with AccountSection content.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarSidebarLayout } from '@/components/container/NavbarSidebarLayout';
import { SidebarMenu } from '@/components/ui/navigation';
import { Typography } from '@/components/ui';
import { AccountSection } from '@/domains/account/pages/sections/AccountSection';
import { accountSettingsItems } from '@/config/menus/accountMenu';

/**
 * Renders the account settings page with sidebar navigation.
 *
 * @returns Account settings page component
 */
export function PageAccountSettings()
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
            title={t( 'pages.userSettings.title' )}
            description={t( 'pages.userSettings.description' )}
        >
            <NavbarSidebarLayout
                sidebar={<SidebarMenu items={sidebarItems} />}
                mobileNav={<SidebarMenu items={sidebarItems} orientation="horizontal" />}
            >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    {t( 'pages.userSettings.title' )}
                </Typography>
                <AccountSection />
            </NavbarSidebarLayout>
        </Page>
    );
}

export default PageAccountSettings;
