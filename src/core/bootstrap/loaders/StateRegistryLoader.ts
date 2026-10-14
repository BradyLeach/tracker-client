import { stateRegistry } from '@/core/models/StateRegistry';
import { stateGraphService } from '@/domains/state';
import type { BootstrapLoader } from '../types';

/**
 * Loads the state graphs and starts the projection over them.
 *
 * Two steps, in this order: the records reach the store through the ordinary path, and only
 * then does the registry subscribe — `connect()` resolves on the first emission of every
 * table, so boot completes with the lookups populated rather than merely subscribed.
 */
export class StateRegistryLoader implements BootstrapLoader<void>
{
    name = 'stateGraphs';
    critical = true;

    async load(): Promise<void>
    {
        await stateGraphService.ensureLoaded();
        await stateRegistry.connect();
    }
}
