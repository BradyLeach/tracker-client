/**
 * Button - App UI component for actions
 *
 * Thin wrapper over CustomButton (MUI Button + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Button usage.
 *
 * Note: Specialized variants (CustomOutlinedButton, CustomDisabledButton, CustomSocialButton)
 * exist in theme-elements for specific use cases.
 *
 * @example
 * ```tsx
 * import { Button } from '@/components/ui/inputs';
 *
 * <Button variant="contained" color="primary">Click Me</Button>
 * ```
 */
import CustomButton from '@/theme/theme-elements/inputs/CustomButton';
import type { ButtonProps } from '@mui/material';
 
export function Button( props: ButtonProps<any> )
{
    return <CustomButton {...props} />;
}

export default Button;
