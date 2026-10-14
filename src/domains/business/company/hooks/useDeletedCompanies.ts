/**
 * useDeletedCompanies
 *
 * The trash list. Deliberately outside the domain store — a trash view fetches from the
 * server with `includeDeleted`, scoped to that view, rather than teaching the store about
 * `deletedAt` for a screen that is opened rarely and on purpose.
 *
 * This talks to `dataService` directly and holds its own state — a plain fetch, not a
 * cached query.
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/core/utils';
import type { ApiError } from '@/services/dataService/dataService.types';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export interface UseDeletedCompaniesResult
{
    data: Company[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: ApiError | undefined;
    refetch: () => void;
}

export function useDeletedCompanies(): UseDeletedCompaniesResult
{
    const [data, setData] = useState<Company[] | undefined>( undefined );
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

        void companyService.listDeleted().then( ( response ) =>
        {
            if( cancelled ) return;

            if( response.error )
            {
                logger.error( 'Failed to load company trash', { error: response.error } );
                setError( response.error );
            }
            else
            {
                setData( response.data ?? [] );
            }

            setIsLoading( false );
        } );

        return () => { cancelled = true; };
    }, [tick] );

    const refetch = useCallback( () => setTick( previous => previous + 1 ), [] );

    return { data, isLoading, isError: !!error, error, refetch };
}
