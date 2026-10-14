/**
 * AccountSection.tsx
 *
 * Account identity section for the account settings page.
 * Owns identity data fetching, mutation, and all rendering
 * (skeleton, error, form, status block, security sub-section, save buttons).
 */
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Card,
    Stack,
    Button,
    Skeleton
} from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { StatusBlock } from '@/components/forms/display';
import { IdentityFormRenderer } from '@/domains/account/identity';
import { useUpdateIdentity } from '@/domains/account/identity/hooks/useUpdateIdentity';
import { useCurrentIdentity } from '@/domains/account/identity/hooks/useCurrentIdentity';
import { formatApiError } from '@/core/utils';
import type { StatusItemConfig } from '@/components/forms/types/formConfig.types';

/**
 * Renders the account identity section: loading skeleton, error state,
 * or the full identity form with status block, security sub-section, and save buttons.
 *
 * @returns Account section content
 */
export function AccountSection()
{
    const { t } = useTranslation();
    const { data: identity, isLoading, isError } = useCurrentIdentity();
    const mutation = useUpdateIdentity();

    if( isLoading )
    {
        return (
            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Stack gap={2}>
                        <Skeleton variant="rounded" height={56} />
                        <Skeleton variant="rounded" height={56} />
                        <Skeleton variant="rounded" height={56} />
                        <Skeleton variant="rounded" height={56} />
                        <Skeleton variant="rounded" height={56} />
                    </Stack>
                </Card>
            </Stack>
        );
    }

    if( isError || !identity )
    {
        return (
            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Typography color="error">
                        {t( 'messages.error.loadFailed' )}
                    </Typography>
                </Card>
            </Stack>
        );
    }

    const statusItems: StatusItemConfig[] = [
        {
            value: identity.status ?? 'pending',
            labelKey: 'shared.labels.status',
            translationKey: `shared.status.${identity.status ?? 'pending'}`,
        },
        {
            value: identity.identityVerificationStatus ?? 'unverified',
            labelKey: 'shared.labels.verificationStatus',
            translationKey: `shared.verificationStatus.${identity.identityVerificationStatus ?? 'unverified'}`,
        },
    ];

    const handleSubmit = ( data: Partial<typeof identity> ) =>
        mutation.mutate( { id: identity.id, data } );

    const formError = mutation.error ? formatApiError( t, mutation.error ) : undefined;

    return (
        <Stack spacing={3}>
            <IdentityFormRenderer
                identity={identity}
                onSubmit={handleSubmit}
                loading={mutation.isPending}
                error={formError}
                groupLayout="grid"
            />

            <Box sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr', lg: '1fr 1fr' },
                mt: 3,
            }}>
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {t( 'pages.userSettings.sections.accountStatus' )}
                    </Typography>
                    <StatusBlock items={statusItems} />
                </Box>

                <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {t( 'pages.userSettings.sections.security' )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t( 'pages.userSettings.sections.securityDescription' )}
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                        {t( 'pages.userSettings.actions.resetPassword' )}
                    </Button>
                </Box>
            </Box>

            {/* Desktop: inline button, bottom-right */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'flex-end' }}>
                <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    form="identity-form"
                    disabled={mutation.isPending}
                    sx={{ minWidth: 200 }}
                >
                    {mutation.isPending ? t( 'shared.interactions.loading' ) : t( 'shared.buttons.save' )}
                </Button>
            </Box>

            {/* Mobile: floating action button, fixed bottom-right */}
            <Button
                color="primary"
                variant="contained"
                type="submit"
                form="identity-form"
                disabled={mutation.isPending}
                aria-label={t( 'shared.buttons.save' )}
                sx={{
                    display: { xs: 'flex', lg: 'none' },
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 1050,
                    minWidth: 56,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    boxShadow: 6,
                }}
            >
                <IconRenderer iconKey="save" size={24} />
            </Button>
        </Stack>
    );
}

export default AccountSection;
