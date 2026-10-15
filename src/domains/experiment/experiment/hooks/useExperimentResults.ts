/**
 * useExperimentResults
 *
 * An experiment's results for one trend grouping.
 *
 * This talks to `dataService` directly and holds its own state — a plain fetch, not a
 * cached query: the value is computed by the server at read time and never stored.
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/core/utils';
import type { ApiError } from '@/services/dataService/dataService.types';
import { experimentService } from '../services/experiment.service';
import type { ExperimentResults } from '../types/experiment.types';
import type { ResultGrouping } from '@/domains/metric';

export interface UseExperimentResultsResult
{
    data: ExperimentResults | undefined;
    isLoading: boolean;
    isError: boolean;
    error: ApiError | undefined;
    refetch: () => void;
}

export function useExperimentResults( id: string | null, groupBy: ResultGrouping ): UseExperimentResultsResult
{
    const [data, setData] = useState<ExperimentResults | undefined>( undefined );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<ApiError | undefined>( undefined );

    // Bumped to re-run the effect on demand — the fetch itself is never cached, so a bump is
    // the only thing a refetch needs to trigger.
    const [tick, setTick] = useState( 0 );

    useEffect( () =>
    {
        let cancelled = false;

        if( !( id ) )
        {
            setIsLoading( false );
            return;
        }

        setIsLoading( true );
        setError( undefined );

        void experimentService.getResults( id!, groupBy ).then( ( response ) =>
        {
            if( cancelled ) return;

            if( response.error )
            {
                logger.error( 'Failed to load experiment results', { error: response.error } );
                setError( response.error );
            }
            else
            {
                setData( response.data );
            }

            setIsLoading( false );
        } );

        return () => { cancelled = true; };
    }, [id, groupBy, tick] );

    const refetch = useCallback( () => setTick( previous => previous + 1 ), [] );

    return { data, isLoading, isError: !!error, error, refetch };
}
