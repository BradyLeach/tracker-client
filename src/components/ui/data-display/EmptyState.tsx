import { Box } from '../layout/Box';
import { Card } from '../surfaces/Card';
import { Stack } from '../layout/Stack';
import { Typography } from '../typography/Typography';
import { Button } from '../inputs/Button';
import { IconRenderer } from '../icons/Icon';
import type { IconKey } from '@/config/icons.config';

export type EmptyStateAction = {
    label: string;
    variant: 'contained' | 'outlined' | 'text';
    onClick: () => void;
};

export type EmptyStateProps = {
    /** Illustration for the page size. The compact size has none. */
    icon?: IconKey;
    headline: string;
    subtext: string;
    actions: EmptyStateAction[];
    /**
     * `page` — a whole page with nothing in it: its own card and a large illustration.
     * `compact` — an empty collection inside a section that is already the surface.
     */
    size?: 'page' | 'compact';
};

export function EmptyState( { icon, headline, subtext, actions, size = 'page' }: EmptyStateProps )
{
    if( size === 'compact' )
    {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ textAlign: 'center', height: '100%', px: 3, py: 3 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
                    {headline}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {subtext}
                </Typography>
                <Stack direction="row" justifyContent="center" gap={1.5} sx={{ mt: 2 }}>
                    {actions.map( action => (
                        <Button key={action.label} size="small" variant={action.variant} onClick={action.onClick}>
                            {action.label}
                        </Button>
                    ) )}
                </Stack>
            </Stack>
        );
    }

    return (
        <Card sx={{ textAlign: 'center', py: 15, px: 5 }}>
            <Stack alignItems="center" gap={0}>
                {icon && (
                    <Box sx={{ color: 'primary.main', opacity: 0.25, lineHeight: 0 }}>
                        <IconRenderer iconKey={icon} size={80} color="currentColor" stroke={1} />
                    </Box>
                )}
            </Stack>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 }}>
                {headline}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {subtext}
            </Typography>
            <Stack direction="row" justifyContent="center" gap={2} sx={{ mt: 4 }}>
                {actions.map( action => (
                    <Button key={action.label} variant={action.variant} onClick={action.onClick}>
                        {action.label}
                    </Button>
                ) )}
            </Stack>
        </Card>
    );
}
