/**
 * TagsInput - App UI component for entering a list of free-text values as chips
 *
 * Thin wrapper over CustomAutocomplete in multiple, freeSolo mode. Typing a value and
 * pressing Enter adds it; suggestions, when given, can be picked instead. The value is
 * always a plain string array.
 */
import CustomAutocomplete from '@/theme/theme-elements/forms/CustomAutocomplete';

export interface TagsInputProps
{
    /** The current values. */
    value: string[];
    /** Fires with the whole new list whenever a value is added or removed. */
    onChange: ( value: string[] ) => void;
    /** Values offered for picking; anything else can still be typed. */
    suggestions?: string[];
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    id?: string;
}

export function TagsInput( {
    value,
    onChange,
    suggestions = [],
    placeholder,
    error,
    helperText,
    disabled,
    fullWidth = true,
    id,
}: TagsInputProps )
{
    return (
        <CustomAutocomplete
            id={id}
            multiple
            freeSolo
            options={suggestions}
            value={value}
            onChange={( _event: React.SyntheticEvent, next: string[] ) =>
                onChange( [...new Set( next.map( item => item.trim() ).filter( Boolean ) )] )}
            fullWidth={fullWidth}
            disabled={disabled}
            placeholder={value.length ? undefined : placeholder}
            error={error}
            helperText={helperText}
        />
    );
}
