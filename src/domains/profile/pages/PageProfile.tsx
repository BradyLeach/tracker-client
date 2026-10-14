/**
 * PageProfile.tsx
 *
 */
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { Typography } from '@/components/ui';

/**
 * Renders the account settings page with authenticated layout.
 *
 * Follows the Page wrapper pattern - simple and clean like auth pages:
 * - Page component handles layout and navbar
 * - This component focuses on content only
 *
 * @returns Account settings page component
 */
export function PageProfile()
{
    return (
        <Page
            title="Account Settings"
            description="Manage your account settings and preferences"
        >
            <NavbarLayout>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}> PROFILE PAGE </Typography>
            </NavbarLayout>
        </Page>
    );
}

export default PageProfile;
