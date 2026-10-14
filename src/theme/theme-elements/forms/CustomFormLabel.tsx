
import { styled } from '@mui/material/styles';
import { FormLabel } from '@mui/material';

const CustomFormLabel = styled( FormLabel )( ( { theme } ) => ( {
    marginBottom: '1px',
    marginTop: '15px',
    display: 'block',
    fontWeight: 100,
    fontSize: theme.typography.subtitle1.fontSize,
    lineHeight: theme.typography.subtitle1.lineHeight,
    color: theme.palette.text.primary,
} ) );

export default CustomFormLabel;