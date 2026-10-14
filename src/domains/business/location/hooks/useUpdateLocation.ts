/**
 * useUpdateLocation
 *
 * Updates a location. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { locationService } from '../services/location.service';
import type { Location } from '../types/location.types';

export function useUpdateLocation( id: string )
{
    return useDataMutation<Location, Partial<Location>>( async ( data ) =>
    {
        const response = await locationService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
