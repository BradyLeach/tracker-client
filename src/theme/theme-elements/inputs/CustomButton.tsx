
import { Button, type ButtonProps } from '@mui/material';

/**
 * CustomButton - Theme-element wrapper for MUI Button
 *
 * Provides decoupled Button primitive for actions.
 * Currently a passthrough wrapper - customize here for app-wide Button behavior.
 *
 * Note: Specialized variants (CustomOutlinedButton, CustomDisabledButton, CustomSocialButton)
 * exist for specific use cases.
 */
const CustomButton = ( props: ButtonProps ) => <Button {...props} />;

export default CustomButton;
export type { ButtonProps };
