/**
 * Container - App UI component for page width constraints
 *
 * Thin wrapper over CustomContainer (MUI Container + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Container usage.
 *
 * @example
 * ```tsx
 * import { Container } from '@/components/ui/layout';
 *
 * <Container maxWidth="lg">
 *   <PageContent />
 * </Container>
 * ```
 */
import CustomContainer from '@/theme/theme-elements/layout/CustomContainer';
import type { ContainerProps } from '@mui/material';

export function Container( props: ContainerProps )
{
    return <CustomContainer {...props} />;
}

export default Container;
