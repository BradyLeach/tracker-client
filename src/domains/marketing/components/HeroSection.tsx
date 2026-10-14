import { Box, Typography, Button, Stack, Grid, Card, Container, IconRenderer, useTheme, alpha } from '@/components/ui';
import type { IconKey } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import LogoTile from '@/components/branding/LogoTile';

/**
 * Capabilities as the platform spec states them, so the landing page never
 * promises more than the product does.
 */
const FEATURES: { icon: IconKey; title: string; lead: string; desc: string; }[] = [
    {
        icon: 'layoutGrid',
        title: 'The Bullseye Workflow',
        lead: 'Find the channel that moves the needle.',
        desc: 'Every traction channel is ready to use. Move ideas between the outer, middle and inner rings '
            + 'as the evidence comes in.',
    },
    {
        icon: 'clipboardCheck',
        title: 'Falsifiable Experiments',
        lead: 'Decide before you start what success looks like.',
        desc: 'Each experiment states a hypothesis, a primary measure, a success threshold, a window and its attribution.',
    },
    {
        icon: 'trendingUp',
        title: 'Metrics Without Code',
        lead: 'Build the measure you need from the data you have.',
        desc: 'Aggregations, dimension filters and time windows are configured in the app, with trends charted '
            + 'against your threshold.',
    },
    {
        icon: 'percentage',
        title: 'Built-in Calculators',
        lead: 'The standard growth formulas, ready to use.',
        desc: 'Paid acquisition, unit economics, viral, email, sales and cohort calculators, plus your own '
            + 'formulas over your metrics.',
    },
    {
        icon: 'cloudComputing',
        title: 'One Way In for Data',
        lead: 'Push, pull or enter it by hand.',
        desc: 'Events, scheduled connectors and manual entry all land through a single idempotent write path.',
    },
    {
        icon: 'shieldCheck',
        title: 'Private by Design',
        lead: 'Your experiments are your IP.',
        desc: 'Experiments, measurements, metrics and learnings are private to your account. No public links, '
            + 'no cross-tenant benchmarking.',
    },
];

const EXPERIMENT_POINTS = [
    'A falsifiable hypothesis.',
    'A primary measure and a success threshold with a direction.',
    'A window and attribution for every variant, control included.',
    'A decision to persevere, pivot or kill, and a written learning.',
];

/**
 * Landing hero for Tracker.
 *
 * Styling resolves entirely through the app theme so light and dark modes
 * stay consistent.
 *
 * @returns Marketing hero, feature bands, experiment band and closing CTA
 */
export default function HeroSection()
{
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.default' }}>

            {/* ── Hero ───────────────────────────────────────────────── */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    py: { xs: 8, md: 12 },
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(120% 90% at 0% 0%, ${theme.palette.background.gradient.middle} 0%, ${theme.palette.background.gradient.start} 38%, transparent 70%)`,
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative' }}>
                    <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{ letterSpacing: '0.12em', fontWeight: 700 }}
                            >
                                Traction experiments
                            </Typography>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mt: 1 }}>
                                {/* Matches the presence the original badge had at
                                    72px, stepped down with the heading on small
                                    screens. */}
                                <Box sx={{ width: { xs: 56, sm: 64, md: 72 }, flexShrink: 0 }}>
                                    <LogoTile disableLink size="100%" />
                                </Box>
                                <Typography
                                    variant="h1"
                                    color="text.primary"
                                    sx={{
                                        fontWeight: 800,
                                        lineHeight: 1.08,
                                        fontSize: { xs: 34, sm: 44, md: 54 },
                                    }}
                                >
                                    Tracker
                                </Typography>
                            </Stack>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mt: 2.5, maxWidth: 560, fontSize: { xs: 15.5, md: 17.5 }, lineHeight: 1.7 }}
                            >
                                Plan, run and measure traction experiments. From the first channel idea to the learning
                                that decides what you do next.
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mt: 4, maxWidth: { xs: 400, sm: 'none' } }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{ fontWeight: 700, px: 4 }}
                                    onClick={() => navigate( '/auth/register' )}
                                >
                                    Get started
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    sx={{ fontWeight: 700, px: 4 }}
                                    onClick={() => navigate( '/auth/login' )}
                                >
                                    Login
                                </Button>
                            </Stack>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                Ditch the spreadsheets and find the channel that works.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Card sx={{ p: { xs: 3, md: 3.5 } }}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                    Every experiment states
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                    Experiments run through draft, running, concluded and abandoned. Concluding
                                    freezes the results, so a finished experiment always reads the same.
                                </Typography>

                                <Stack spacing={1.5} sx={{ mt: 3 }}>
                                    {EXPERIMENT_POINTS.map( ( point ) => (
                                        <Stack key={point} direction="row" spacing={1.5} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    mt: '2px',
                                                    width: 22,
                                                    height: 22,
                                                    flexShrink: 0,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: alpha( theme.palette.success.main, 0.14 ),
                                                    color: 'success.main',
                                                }}
                                            >
                                                <IconRenderer iconKey="check" size={14} stroke={3} />
                                            </Box>
                                            <Typography variant="body2" color="text.primary">
                                                {point}
                                            </Typography>
                                        </Stack>
                                    ) )}
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── Features ───────────────────────────────────────────── */}
            <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    {FEATURES.map( ( feature ) => (
                        <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Card sx={{ p: { xs: 3, md: 3.5 }, height: '100%' }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha( theme.palette.primary.main, 0.12 ),
                                        color: 'primary.main',
                                    }}
                                >
                                    <IconRenderer iconKey={feature.icon} size={22} />
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mt: 2.5 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mt: 1.25 }}>
                                    {feature.lead}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {feature.desc}
                                </Typography>
                            </Card>
                        </Grid>
                    ) )}
                </Grid>
            </Container>

            {/* ── Closing CTA ────────────────────────────────────────── */}
            <Box sx={{ bgcolor: 'background.paper', py: { xs: 7, md: 11 } }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ fontSize: { xs: 26, md: 36 }, lineHeight: 1.25, px: { xs: 1, sm: 0 } }}
                    >
                        Ready to find your traction?
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2.5, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}
                    >
                        Channels, experiments, metrics and learnings in one place. Start your account and
                        run your first experiment today.
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ mt: 4 }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ fontWeight: 700, px: 4 }}
                            onClick={() => navigate( '/auth/register' )}
                        >
                            Get started
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            sx={{ fontWeight: 700, px: 4 }}
                            onClick={() => navigate( '/auth/login' )}
                        >
                            Login
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
