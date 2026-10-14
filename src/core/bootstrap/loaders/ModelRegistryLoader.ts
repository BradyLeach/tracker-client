import { modelRegistry } from '@/core/models/ModelRegistry';
import type { BootstrapLoader } from '../types';

export class ModelRegistryLoader implements BootstrapLoader<void>
{
    name = 'models';
    critical = true;

    async load(): Promise<void>
    {
        await modelRegistry.load();
    }
}