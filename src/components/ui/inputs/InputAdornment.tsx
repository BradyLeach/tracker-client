/**
 * InputAdornment - App UI component for input decorations
 *
 * Thin wrapper over CustomInputAdornment (MUI InputAdornment + Modernize theme).
 * Provides stable import surface for icons/text inside inputs.
 *
 * @example
 * ```tsx
 * import { InputAdornment } from '@/components/ui/inputs';
 *
 * <InputAdornment position="start">
 *   <SearchIcon />
 * </InputAdornment>
 * ```
 */
import CustomInputAdornment from '@/theme/theme-elements/inputs/CustomInputAdornment';
import type { InputAdornmentProps } from '@mui/material';

export function InputAdornment( props: InputAdornmentProps )
{
    return <CustomInputAdornment {...props} />;
}

export default InputAdornment;
