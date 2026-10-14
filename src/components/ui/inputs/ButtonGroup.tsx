/**
 * ButtonGroup - App UI component for actions
 *
 * Thin wrapper over CustomButtonGroup (MUI ButtonGroup + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide ButtonGroup usage.
 *
 * Note: Specialized variants (CustomOutlinedButtonGroup, CustomDisabledButtonGroup, CustomSocialButtonGroup)
 * exist in theme-elements for specific use cases.
 *
 * @example
 * ```tsx
 * import { ButtonGroup } from '@/components/ui/inputs';
 *
 * <ButtonGroup variant="contained" color="primary">Click Me</ButtonGroup>
 * ```
 */
import CustomButtonGroup from '@/theme/theme-elements/inputs/CustomButtonGroup';
import type { ButtonGroupProps } from '@mui/material';

export function ButtonGroup( props: ButtonGroupProps )
{
    return <CustomButtonGroup {...props} />;
}

export default ButtonGroup;
