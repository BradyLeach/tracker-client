import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { pingService } from '@/core/systems/ping/ping.service';
import { formatApiError } from '@/core/utils';
import { useTranslation } from 'react-i18next';

/**
 *
 * @returns
 */
export function ComponentApiTest()
{
    const [result, setResult] = useState<string>( '' );
    const { t } = useTranslation();

    const handleTest = async () =>
    {
        setResult( 'Loading...' );

        const res = await pingService.ping();
        console.log( res );
        setResult( JSON.stringify( res.data ) );

        // show error if error
        if( res.error )
        {
            setResult( formatApiError( t, res.error ) );
        }
    };

    return (
        <Box p={4}>
            <Button variant="contained" color="primary" onClick={handleTest}>Test API Connection</Button>
            <Box style={{ marginTop: 10 }}>{result}</Box>
        </Box>
    );
};
