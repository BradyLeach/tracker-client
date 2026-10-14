import { modelRegistry } from '@/core/models/ModelRegistry';
import type { BootstrapLoader } from '../types';

/**
 * Loads the model definitions the unauthenticated forms validate against.
 *
 * The full set is authenticated, so pre-auth gets the backend's public whitelist:
 * enough for login, registration and the newsletter form. ModelRegistryLoader replaces
 * it with the full set after login.
 */
export class PublicModelRegistryLoader implements BootstrapLoader<void>
{
    name = 'publicModels';
    critical = true;

    async load(): Promise<void>
    {
        await modelRegistry.loadPublic();
    }
}
