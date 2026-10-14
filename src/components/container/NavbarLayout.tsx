import { type ReactNode } from 'react';
import { Container, Box } from '@/components/ui';
import { AuthenticatedShell } from './_AuthenticatedShell';

interface NavbarLayoutProps
{
    children: ReactNode;
    banner?: ReactNode;
    /** Page title, rendered in the header row rather than by the page. */
    title?: string;
    /**
     * Right-hand detail panel. Sits beside the content column at full page
     * height — a panel nested inside the content would be bounded by whatever
     * card it landed in.
     */
    detailPanel?: ReactNode;
}

/**
 * NavbarLayout
 *
 * The base page container: a viewport-bounded row of two regions — the main
 * area and the detail panel — each scrolling on its own.
 *
 * Every `minHeight: 0` below is load-bearing. A flex item will not shrink
 * below its content without it, so a missing one reverts the chain to content
 * height and the page scrolls as one again.
 */
export function NavbarLayout( { children, banner, title, detailPanel }: NavbarLayoutProps )
{
    return (
        <AuthenticatedShell banner={banner} title={title}>
            <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        // A flex item defaults to minWidth:auto, which lets it grow
                        // past its container to fit content — wide children such as
                        // a scrollable tab strip then widen the whole page.
                        minWidth: 0,
                        minHeight: 0,
                        overflowY: 'auto',
                    }}
                >
                    <Container
                        sx={{
                            pt: { xs: '20px', sm: '30px' },
                            pb: '40px',
                            px: { xs: 2, sm: 3 },
                            maxWidth: '100%!important',
                        }}
                    >
                        {children}
                    </Container>
                </Box>
                {detailPanel}
            </Box>
        </AuthenticatedShell>
    );
}

export default NavbarLayout;
