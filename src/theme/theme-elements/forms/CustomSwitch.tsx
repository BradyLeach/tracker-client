
import { styled } from '@mui/material/styles';
import { Switch } from '@mui/material';

const CustomSwitch = styled( ( props: any ) => <Switch {...props} /> )( ( { theme } ) => ( {
    '&.MuiSwitch-root': {
        width: '68px',
        height: '49px',
    },
    '&  .MuiButtonBase-root': {
        top: '6px',
        left: '6px',
    },
    '&  .MuiButtonBase-root.Mui-checked .MuiSwitch-thumb': {
        backgroundColor: 'primary.main',
    },
    '& .MuiSwitch-thumb': {
        width: '18px',
        height: '18px',
        borderRadius: '6px',
    },

    '& .MuiSwitch-track': {
        backgroundColor: theme.palette.grey[200],
        opacity: 1,
        borderRadius: '5px',
    },
    '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
            '& + .MuiSwitch-track': {
                backgroundColor: 'primary',
                opacity: 0.18,
            },
        },
    },

    // The same switch scaled down for dense rows, such as a menu's footer.
    '&.MuiSwitch-sizeSmall': {
        width: '48px',
        height: '32px',
        padding: '8px',
        '& .MuiButtonBase-root': {
            top: '4px',
            left: '4px',
            padding: '4px',
        },
        '& .MuiButtonBase-root.Mui-checked': {
            transform: 'translateX(16px)',
        },
        '& .MuiSwitch-thumb': {
            width: '16px',
            height: '16px',
            borderRadius: '4px',
        },
        '& .MuiSwitch-track': {
            borderRadius: '4px',
        },
    },
} ) );

export default CustomSwitch;
