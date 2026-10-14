import { useDataMutation } from '@/services/domain/useDataQuery';
import { partnershipService } from '../services/partnership.service';
import type { Partnership } from '../types/partnership.types';

interface TransitionPayload
{
    partnershipId: string;
    transitionId: string;
}

export function useTransitionPartnership()
{
    return useDataMutation<Partnership, TransitionPayload>( async ( { partnershipId, transitionId } ) =>
    {
        const response = await partnershipService.transition( partnershipId, transitionId );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
