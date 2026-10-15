/**
 * useConnectorCatalog
 *
 * Every configured connector and its declaration — what connection forms are built from.
 *
 * This talks to `dataService` directly and holds its own state — a plain fetch, not a
 * cached query: the value is computed by the server at read time and never stored.
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/core/utils';
import type { ApiError } from '@/services/dataService/dataService.types';
import { dataService } from '@/services/dataService/dataService';
import type { ConnectorDescriptor } from '../types/connection.types';

export interface UseConnectorCatalogResult
{
    data: ConnectorDescriptor[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: ApiError | undefined;
    refetch: () => void;
}

export function useConnectorCatalog(): UseConnectorCatalogResult
{
    const [data, setData] = useState<ConnectorDescriptor[] | undefined>( undefined );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<ApiError | undefined>( undefined );

    // Bumped to re-run the effect on demand — the fetch itself is never cached, so a bump is
    // the only thing a refetch needs to trigger.
    const [tick, setTick] = useState( 0 );

    useEffect( () =>
    {
        let cancelled = false;

        setIsLoading( true );
        setError( undefined );

        void dataService.get<ConnectorDescriptor[]>( 'system/connectors' ).then( ( response ) =>
        {
            if( cancelled ) return;

            if( response.error )
            {
                logger.error( 'Failed to load connector catalog', { error: response.error } );
                setError( response.error );
            }
            else
            {
                setData( response.data );
            }

            setIsLoading( false );
        } );

        return () => { cancelled = true; };
    }, [tick] );

    const refetch = useCallback( () => setTick( previous => previous + 1 ), [] );

    return { data, isLoading, isError: !!error, error, refetch };
}
