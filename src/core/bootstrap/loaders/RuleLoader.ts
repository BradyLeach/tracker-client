import { ruleRegistry } from '@/core/businessRules/RuleRegistry';
import type { BootstrapLoader } from '../types';

export class RuleLoader implements BootstrapLoader<void>
{
    name = 'rule';
    critical = true;

    async load(): Promise<void>
    {
        await ruleRegistry.load();
    }
}
