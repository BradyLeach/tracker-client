import { typeRegistry } from '@/core/models/TypeRegistry';
import { systemTypeService } from '@/domains/system/services/systemType.service';
import type { BootstrapLoader } from '../types';

/**
 * Loads the system type catalogs and starts the projection over them.
 *
 * Two steps, in this order: the records reach the store through the ordinary path, and only
 * then does the registry subscribe — `connect()` resolves on the first emission of every
 * catalog, so boot completes with the lookups populated rather than merely subscribed.
 */
export class TypeRegistryLoader implements BootstrapLoader<void>
{
    name = 'systemTypes';
    critical = true;

    async load(): Promise<void>
    {
        await systemTypeService.ensureLoaded();
        await typeRegistry.connect();
    }
}
