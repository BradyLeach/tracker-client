import { type ElementType } from 'react';
import { Box, Card } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Props for FormContainer component
 */
type FormContainerProps = {
    children: React.ReactNode;
    /** Cap the form width via the container (renderer stays 100%) */
    maxWidth?: number | string | { xs?: number | string; sm?: number | string; md?: number | string };
    /** Inner padding for the card/container */
    p?: number;
    /** Optional extra sx */
    sx?: SxProps<Theme>;
    /** Render with Card chrome (true) or plain Box (false) */
    card?: boolean;
    /** Center vertically on md+ screens */
    center?: boolean;
};

/**
 * Responsive container for forms with optional Card chrome and vertical centering.
 * Provides consistent layout and spacing for authentication and data entry forms.
 *
 * @param props - Component props
 * @returns Rendered form container
 */
function FormContainer( {
    children,
    maxWidth = { xs: 380, sm: 440, md: 520 },
    p = 4,
    sx,
    card = true,
    center = true,
}: FormContainerProps )
{
    const Wrapper: ElementType = card ? Card : Box;

    return (
        <Box
            sx={{
                minHeight: '100dvh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: { xs: 'flex-start', md: center ? 'center' : 'flex-start' },
                px: 2,
                py: 6,
                overflowX: 'hidden',
            }}
        >

            <Wrapper sx={{ width: '100%', maxWidth, p, mx: 'auto', overflow: 'visible', ...sx }}>
                {children}
            </Wrapper>
        </Box>
    );
}

export default FormContainer;