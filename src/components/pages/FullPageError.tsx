import { Box, Typography, Button, Container } from '@mui/material';
import ErrorImg from '@/assets/svg/backgrounds/error-cat-min.svg?react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface FullPageErrorProps
{
    /** Optional error ID for support/debug display */
    errorId?: string;

    /** Retry handler (caller decides what retry means) */
    onRetry?: () => void;
}

/**
 * Full-page error display component with retry functionality.
 * Used for critical application errors or bootstrap failures.
 *
 * @param props - Component props
 * @returns Full-page error UI with retry button
 */
export function FullPageError( { errorId, onRetry }: FullPageErrorProps )
{
    const { t } = useTranslation();
    const pageTitle = t( 'pages.error.title' );
    const errorMessage = t( 'pages.error.subtitle' );
    const errorCode = errorId ? `${t( 'pages.error.code' )}: ${errorId}` : '';

    const theme = useTheme();

    const handleRetry = () =>
    {
        if( onRetry )
        {
            onRetry();
        }
        else
        {
            window.location.reload();
        }
    };

    return (
        <Container
            sx={{
                height: '100vh',
                width: '100%',
                maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
                mx: 'auto',
                px: { xs: 5, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                    '& svg path': { fill: `${theme.palette.primary.main} !important`, },
                    mb: 3,
                }}
            >
                <ErrorImg
                    style={{ width: '100%', height: '100%', }}
                    viewBox="0 0 600 256"
                />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom color="primary.main">
                {pageTitle}
            </Typography>
            <Typography variant="h6" color='primary.main' sx={{ mb: 3 }}>
                {errorMessage}
            </Typography>

            { // REnder the error code if it exists
                errorCode && (
                    <Typography variant="body2" color='primary.main' sx={{ mb: 3 }}>
                        {errorCode}
                    </Typography>
                )
            }

            <Button
                variant="contained"
                color="primary"
                onClick={handleRetry}
                size="large"
            >
                {t( 'pages.error.retry' )}
            </Button>
        </Container>
    );
}