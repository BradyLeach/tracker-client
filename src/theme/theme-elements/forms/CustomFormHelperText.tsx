
import { FormHelperText, type FormHelperTextProps } from '@mui/material';

/**
 * CustomFormHelperText - Theme-element wrapper for MUI FormHelperText
 *
 * Provides decoupled FormHelperText for input helper/error messages.
 * Currently a passthrough wrapper - customize here for app-wide FormHelperText behavior.
 */
const CustomFormHelperText = ( props: FormHelperTextProps ) => <FormHelperText {...props} />;

export default CustomFormHelperText;
