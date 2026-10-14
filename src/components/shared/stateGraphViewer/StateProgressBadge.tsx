import { Box, Typography, useTheme } from '@/components/ui';

const BADGE_SIZE = 64;
const BADGE_THICKNESS = 6;

interface StateProgressBadgeProps
{
    percentage: number;
    color: string; // theme palette key
}

export function StateProgressBadge( { percentage, color }: StateProgressBadgeProps )
{
    const theme = useTheme();
    const innerSize = BADGE_SIZE - BADGE_THICKNESS * 2;
    const resolved = ( theme.palette as Record<string, any> )[color]?.main ?? color;
    const track = theme.palette.action.disabledBackground;

    return (
        <Box sx={{
            width:          BADGE_SIZE,
            height:         BADGE_SIZE,
            borderRadius:   '50%',
            background:     `conic-gradient(from -90deg, ${resolved} ${percentage}%, ${track} ${percentage}%)`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
        }}>
            <Box sx={{
                width:          innerSize,
                height:         innerSize,
                borderRadius:   '50%',
                bgcolor:        'background.paper',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
            }}>
                <Typography variant="caption" fontWeight={700} lineHeight={1}>
                    {Math.round( percentage )}%
                </Typography>
            </Box>
        </Box>
    );
}
