
import { InputAdornment, type InputAdornmentProps } from '@mui/material';

/**
 * CustomInputAdornment - Theme-element wrapper for MUI InputAdornment
 *
 * Provides decoupled InputAdornment for icons/text inside inputs.
 * Currently a passthrough wrapper - customize here for app-wide InputAdornment behavior.
 */
const CustomInputAdornment = ( props: InputAdornmentProps ) => <InputAdornment {...props} />;

export default CustomInputAdornment;
