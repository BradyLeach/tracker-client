import { ComponentApiTest } from './PingApi';
import { Box, Typography } from '@mui/material';
// import HeroSection from '../domains/marketing/components/HeroSection';

export function PagePing() 
{
    return ( <Box style={{ padding: 32 }}>
        <Typography variant='h3'>OctoTrain Frontend</Typography>
        <ComponentApiTest />
    </Box> );
};

