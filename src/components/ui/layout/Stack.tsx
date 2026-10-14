/**
 * Stack - App UI component for flex layout composition
 *
 * Thin wrapper over CustomStack (MUI Stack + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Stack usage.
 *
 * @example
 * ```tsx
 * import { Stack } from '@/components/ui/layout';
 *
 * <Stack spacing={2} direction="row">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * ```
 */
import CustomStack from '@/theme/theme-elements/layout/CustomStack';
import type { StackProps } from '@mui/material';

export function Stack( props: StackProps )
{
    return <CustomStack {...props} />;
}

export default Stack;
