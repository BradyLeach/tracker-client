/**
 * EmptyState Playground
 *
 * Both sizes of the empty state, with the props driving each.
 *
 * What to check here:
 * - `page` renders its own card with the large illustration, for a page with nothing in it
 * - `compact` renders inside a ProfileSection body with no card and no illustration, centred
 *   in the section's fixed height, with the add action as its only control
 */

import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, EmptyState } from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';

// ─── Playground ───────────────────────────────────────────────────────────────

export function EmptyStatePlayground()
{
    const { t } = useTranslation();

    const pageProps = {
        icon: 'buildingWarehouse' as const,
        headline: t( 'pages.partnerships.emptyState.headline' ),
        subtext: t( 'pages.partnerships.emptyState.subtext' ),
        actions: [{ label: t( 'pages.company.partner.addButton' ), variant: 'contained' as const, onClick: () => undefined }],
    };

    const compactProps = {
        size: 'compact' as const,
        headline: t( 'pages.company.location.emptyState.headline' ),
        subtext: t( 'pages.company.location.emptyState.subtext' ),
        actions: [{ label: t( 'pages.company.location.addButton' ), variant: 'contained' as const, onClick: () => undefined }],
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>EmptyState</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 680 }}>
                A collection with nothing in it. The page size fills an empty page; the compact size
                sits inside a section, which hides its search, filter and pagination while empty.
            </Typography>

            <Stack spacing={4}>
                <Typography variant="h6">Page</Typography>
                <EmptyState {...pageProps} />
                <PlaygroundDataPreview title="Page props" caption="Default size." data={pageProps} />

                <Typography variant="h6">Compact</Typography>
                <Box sx={{ maxWidth: 640 }}>
                    <ProfileSection title={t( 'pages.company.section.location' )} bodyHeight={320} disableBodyPadding>
                        <EmptyState {...compactProps} />
                    </ProfileSection>
                </Box>
                <PlaygroundDataPreview title="Compact props" caption="No icon; the section is the surface." data={compactProps} />
            </Stack>
        </Box>
    );
}

export default EmptyStatePlayground;
