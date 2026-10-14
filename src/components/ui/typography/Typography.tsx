/**
 * Typography - App UI component for text rendering
 *
 * Thin wrapper over CustomTypography (MUI Typography + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Typography usage.
 *
 * @example
 * ```tsx
 * import { Typography } from '@/components/ui/typography';
 *
 * <Typography variant="h1">Heading</Typography>
 * <Typography variant="body1">Body text</Typography>
 * ```
 */
import CustomTypography from '@/theme/theme-elements/typography/CustomTypography';
import type { TypographyProps } from '@mui/material';

export type { TypographyProps } from '@mui/material';

export function Typography( props: TypographyProps )
{
    return <CustomTypography {...props} />;
}

export default Typography;
