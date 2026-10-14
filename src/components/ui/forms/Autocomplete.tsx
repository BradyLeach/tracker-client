/**
 * Autocomplete - App UI component for autocomplete/combobox inputs
 *
 * Thin wrapper over CustomAutocomplete (MUI Autocomplete + Modernize theme).
 * Provides stable import surface for all autocomplete usage across app.
 */
import CustomAutocomplete from '@/theme/theme-elements/forms/CustomAutocomplete';
import { IconRenderer } from '../icons/Icon';
import { InputAdornment } from '../inputs';
import { Box } from '../layout';

export interface AutocompleteOption
{
    value: string | number;
    label: string;
    /** Icon registry key drawn beside the label, in the list and in the field once chosen. */
    icon?: string;
}

export interface AutocompleteProps
{
    options: AutocompleteOption[];
    /** Current value as string (option.value coerced, or raw typed string for freeSolo). */
    value: string | null;
    /** Fires when user selects an option or accepts a freeSolo value. */
    onChange: ( value: string | null ) => void;
    /** Fires on every keystroke — use for search-as-you-type service calls. */
    onInputChange?: ( value: string ) => void;
    /** Allow arbitrary user-typed values (not constrained to options list). */
    freeSolo?: boolean;
    /** Show loading spinner in dropdown (use while fetching async options). */
    loading?: boolean;
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    id?: string;
}

export function Autocomplete( {
    options,
    value,
    onChange,
    onInputChange,
    freeSolo = false,
    loading,
    placeholder,
    error,
    helperText,
    disabled,
    fullWidth = true,
    id,
}: AutocompleteProps )
{
    // Convert string value back to MUI's expected option object (or string for freeSolo).
    const muiValue: AutocompleteOption | string | null =
        value === null
            ? null
            : options.find( o => String( o.value ) === value ) ?? ( freeSolo ? value : null );

    const handleChange = (
        _event: React.SyntheticEvent,
        newValue: AutocompleteOption | string | null
    ) =>
    {
        if( newValue === null )
        {
            onChange( null );
        }
        else if( typeof newValue === 'string' )
        {
            onChange( newValue );
        }
        else
        {
            onChange( String( newValue.value ) );
        }
    };

    const handleInputChange = (
        _event: React.SyntheticEvent,
        newInputValue: string,
        reason: string
    ) =>
    {
        if( freeSolo && reason === 'input' )
        {
            onChange( newInputValue || null );
        }
        onInputChange?.( newInputValue );
    };

    // Icons follow the form conventions: the chosen one leads the input like a text field's
    // adornment, and each option lays out like a menu item. Options without icons render as text.
    const hasIcons = options.some( option => option.icon );
    const chosen = typeof muiValue === 'object' ? muiValue : null;

    return (
        <CustomAutocomplete
            id={id}
            startAdornment={chosen?.icon
                ? (
                    <InputAdornment position="start">
                        <IconRenderer iconName={chosen.icon} fallback={null} size={18} />
                    </InputAdornment>
                )
                : undefined}
            renderOption={hasIcons
                ? ( props: React.HTMLAttributes<HTMLLIElement> & { key?: string }, option: AutocompleteOption ) =>
                {
                    const { key, ...optionProps } = props;

                    return (
                        <li key={key} {...optionProps}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <IconRenderer iconName={option.icon} fallback={null} size={20} />
                                {option.label}
                            </Box>
                        </li>
                    );
                }
                : undefined}
            options={options}
            value={muiValue}
            onChange={handleChange}
            onInputChange={handleInputChange}
            freeSolo={freeSolo}
            loading={loading}
            fullWidth={fullWidth}
            disabled={disabled}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            getOptionLabel={( option: AutocompleteOption | string ) =>
                typeof option === 'string' ? option : option.label
            }
            isOptionEqualToValue={( option: AutocompleteOption, val: AutocompleteOption | string ) =>
                typeof val === 'string'
                    ? String( option.value ) === val
                    : option.value === val.value
            }
        />
    );
}

export default Autocomplete;
