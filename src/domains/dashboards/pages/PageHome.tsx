/**
 * PageHome.tsx
 *
 * Home dashboard page for authenticated users.
 */
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { Typography, Skeleton, Stack, Button } from '@/components/ui';
import { IdentityFormRenderer } from '@/domains/account/identity/components/IdentityFormRenderer';
import { useCurrentIdentity } from '@/domains/account/identity/hooks/useCurrentIdentity';
import { useUpdateIdentity } from '@/domains/account/identity/hooks/useUpdateIdentity';
import { formatApiError } from '@/core/utils';

/**
 * Renders the home dashboard page with authenticated layout.
 *
 * @returns Home dashboard page component
 */
export function PageHome()
{
    const { t } = useTranslation();
    const { data: identity, isLoading, isError } = useCurrentIdentity();
    const mutation = useUpdateIdentity();

    const renderIdentityForm = () =>
    {
        if( isLoading )
        {
            return (
                <Stack gap={2}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                </Stack>
            );
        }

        if( isError || !identity )
        {
            return (
                <Typography color="error">
                    {t( 'messages.error.loadFailed' )}
                </Typography>
            );
        }

        return (
            <>
                <IdentityFormRenderer
                    identity={identity}
                    onSubmit={( data ) => mutation.mutate( { id: identity.id, data } )}
                    loading={mutation.isPending}
                    error={mutation.error ? formatApiError( t, mutation.error ) : undefined}
                />
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    form="identity-form"
                    disabled={mutation.isPending}
                    sx={{ mt: 3 }}
                >
                    {mutation.isPending ? t( 'shared.interactions.loading' ) : t( 'shared.buttons.save' )}
                </Button>
            </>
        );
    };

    return (
        <Page
            title="Account Settings"
            description="Manage your account settings and preferences"
        >
            <NavbarLayout>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}> HOME DASHBOARD</Typography>
                {renderIdentityForm()}
            </NavbarLayout>
        </Page>
    );
}

export default PageHome;
