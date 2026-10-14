import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { TransitionEvent } from '../types/transitionEvent.types';

const TRANSITION_EVENTS_PATH = 'system/state/events';

export const transitionEventService =
{
    async getByEntity( entityType: string, entityId: string ): Promise<ApiResponse<TransitionEvent[]>>
    {
        return dataService.query<TransitionEvent>( TRANSITION_EVENTS_PATH, { entityType, entityId } );
    },
};
