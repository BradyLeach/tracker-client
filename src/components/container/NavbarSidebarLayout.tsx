import { type ReactNode } from 'react';
import { Box } from '@/components/ui';
import { AuthenticatedShell } from './_AuthenticatedShell';

interface NavbarSidebarLayoutProps
{
    sidebar: ReactNode;
    mobileNav?: ReactNode;
    children: ReactNode;
}

export function NavbarSidebarLayout( { sidebar, mobileNav, children }: NavbarSidebarLayoutProps )
{
    return (
        <AuthenticatedShell>
            {/* Mobile tab nav — hidden on desktop */}
            {mobileNav && (
                <Box sx={{ display: { xs: 'block', md: 'none' }, borderBottom: 1, borderColor: 'divider' }}>
                    {mobileNav}
                </Box>
            )}

            <Box
                sx={{
                    display: 'flex',
                    flexGrow: 1,
                }}
            >
                {/* Sidebar — fixed 280px, hidden on mobile */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: 280,
                        flexShrink: 0,
                        backgroundColor: 'background.dark',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        py: 3,
                        px: 1,
                        borderRadius: 0
                    }}
                >
                    {sidebar}
                </Box>

                {/* Content — flex, centered, max 1200px */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 3,
                        px: 3,
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 1200 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </AuthenticatedShell>
    );
}

export default NavbarSidebarLayout;
