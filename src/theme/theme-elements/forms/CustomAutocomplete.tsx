
import { styled } from '@mui/material/styles';
import { Autocomplete } from '@mui/material';
import CustomTextField from './CustomTextField';

const CustomAutocomplete = styled( ( props: any ) =>
{
    const { renderInput, placeholder, error, helperText, startAdornment, ...rest } = props;
    return (
        <Autocomplete
            {...rest}
            onKeyDown={( e: React.KeyboardEvent ) =>
            {
                if( e.key === 'Enter' ) e.stopPropagation();
                props.onKeyDown?.( e );
            }}
            renderInput={renderInput ?? ( ( params: any ) => (
                <CustomTextField
                    {...params}
                    // An adornment leads the input, ahead of any MUI places there itself.
                    InputProps={startAdornment
                        ? { ...params.InputProps, startAdornment: <>{startAdornment}{params.InputProps?.startAdornment}</> }
                        : params.InputProps}
                    placeholder={placeholder}
                    error={error}
                    helperText={helperText}
                />
            ) )}
        />
    );
} )( () => ( {} ) );

export default CustomAutocomplete;
