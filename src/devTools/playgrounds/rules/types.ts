export type RuleScenario = 'allowed' | 'limit' | 'verification' | 'feature' | 'compliance';

export interface RuleContext
{
    currentCount: number;
    maxCount: number;
    userAge: number;
    minAge: number;
}

export interface SimulateRuleCheckArgs
{
    scenario: RuleScenario;
    service: string;
    operation: string;
    context: RuleContext;
    demoState?: Record<string, any>;
}