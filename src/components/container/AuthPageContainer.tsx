/**
 * AuthPageContainer - Authentication page layout wrapper
 *
 * Provides consistent 2-column responsive layout for authentication pages (e.g., login, register).
 * - Left column includes branding, gradient background, and optional illustration
 * - Right column centers the main form content
 *
 * Layout behavior:
 * - 100% viewport height and width
 * - Stacked layout on small screens (xs), side-by-side from md and up
 * - Theme-based background and gradients
 *
 * @component
 * @example
 * ```tsx
 * <AuthPageContainer title="Sign Up" description="Join the community">
 *   <RegistrationForm />
 * </AuthPageContainer>
 * ```
 */
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Logo from '@/components/branding/Logo';
import { Page } from '@/components/container/Page';

/**
 * Props for AuthPageContainer
 *
 * @typedef {Object} AuthPageContainerProps
 * @property {React.ReactNode} children - Form or content to display in the right column
 * @property {string} [title] - Page title for document head and SEO
 * @property {string} [description] - Page description for document head and SEO
 * @property {string} [backgroundImage] - Optional image to display in the left column
 */
interface AuthPageContainerProps
{
    children: React.ReactNode;
    title?: string;
    description?: string;
    backgroundImage?: string;
}

/**
 * Renders the authentication layout container with 2-column grid:
 * - Left side: gradient background, branding, and optional image
 * - Right side: centered content (usually a form)
 *
 * @param {AuthPageContainerProps} props - Component props
 * @returns {JSX.Element}
 */
export function AuthPageContainer( {
    children,
    title,
    description,
    backgroundImage,
}: AuthPageContainerProps )
{
    const theme = useTheme();

    return (
        <Page title={title} description={description}>
            <Grid
                container
                spacing={0}
                sx={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                }}
            >
                {/* Left Column */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        lg: 7,
                        xl: 8
                    }}
                    sx={{
                        position: 'relative',
                        backgroundColor: theme.palette.background.paper,
                        '&:before': {
                            content: '""',
                            background: `radial-gradient(
                                ${ theme.palette.background.gradient.start},
                                ${theme.palette.background.gradient.middle},
                                ${theme.palette.background.gradient.end}
                                )`,
                            backgroundSize: '400% 400%',
                            animation: 'gradient 15s ease infinite',
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.3,
                            height: '100%',
                            width: '100%',
                        },
                    }}
                >
                    <Box position="relative">
                        <Box p={3}>
                            <Logo />
                        </Box>
                        {backgroundImage && (
                            <Box
                                alignItems="center"
                                justifyContent="center"
                                height={'calc(100vh - 75px)'}
                                sx={{
                                    display: {
                                        xs: 'none',
                                        lg: 'flex',
                                    },
                                }}
                            >
                                <img
                                    src={backgroundImage}
                                    alt="decoration"
                                    style={{
                                        maxWidth: '480px',
                                        width: '100%',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* Right Column */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        lg: 5,
                        xl: 4
                    }}
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        overflowY: 'auto',
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 480, p: 4 }}>
                        {children}
                    </Box>
                </Grid>
            </Grid>
        </Page>
    );
}

export default AuthPageContainer;
