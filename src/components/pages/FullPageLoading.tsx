import { Box, Container, Typography } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/shared/spinner/Spinner';

interface FullPageLoadingProps
{
    /** Optional message override. Defaults to the app's initialising copy. */
    message?: string;
}

/**
 * Full-page initialising display.
 *
 * Covers the post-login sequence: the model definitions load, the entity store opens from
 * them, and the reference data is fetched and projected. Until that finishes there is no
 * store to read, so a screen rendered early would subscribe to nothing and stay empty —
 * this is the state that says so rather than showing a blank page.
 *
 * Sibling of FullPageError: same shell, the other outcome.
 *
 * @param props - Component props
 * @returns Full-page initialising UI
 */
export function FullPageLoading( { message }: FullPageLoadingProps )
{
    const { t } = useTranslation();

    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
            }}
        >
            <Spinner />

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {t( 'pages.initialising.title' )}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {message ?? t( 'pages.initialising.subtitle' )}
                </Typography>
            </Box>
        </Container>
    );
}
