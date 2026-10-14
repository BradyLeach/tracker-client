import { RULE_CODES } from '@/core/businessRules/ruleCodes';
import type { SimulateRuleCheckArgs, RuleContext } from './types';
import type { RuleCheckResult } from '@/core/businessRules';

export function simulateRuleCheck( {
    scenario,
    service,
    operation,
    context,
}: SimulateRuleCheckArgs ): RuleCheckResult
{
    switch ( scenario )
    {
        case 'limit':
            return handleLimitScenario( service, operation, context );
        case 'verification':
            return handleVerificationScenario( service, operation, context );
        case 'feature':
            return handleFeatureScenario( service, operation );
        case 'compliance':
            return handleComplianceScenario( service, operation );
        default:
            return { allowed: true, service, operation, data: {} };
    }
}

function handleLimitScenario(
    service: string,
    operation: string,
    context: RuleContext
): RuleCheckResult
{
    const { currentCount, maxCount } = context;

    if( currentCount >= maxCount )
    {
        return {
            allowed: false,
            enforcer: RULE_CODES.LIMIT,
            service,
            operation,
            data: { current: currentCount, max: maxCount },
        };
    }

    if( currentCount >= maxCount * 0.8 )
    {
        return {
            allowed: true,
            enforcer: RULE_CODES.LIMIT,
            service,
            operation,
            data: { current: currentCount, max: maxCount },
        };
    }

    return { allowed: true, service, operation, data: {} };
}

function handleVerificationScenario(
    service: string,
    operation: string,
    context: RuleContext
): RuleCheckResult
{
    const { userAge, minAge } = context;

    if( userAge < minAge )
    {
        return {
            allowed: false,
            enforcer: RULE_CODES.VERIFICATION,
            service,
            operation: 'access',
            specific: 'age',
            data: { minAge, expected: minAge, actual: userAge },
        };
    }

    return { allowed: true, service, operation, data: {} };
}

function handleFeatureScenario(
    service: string,
    operation: string
): RuleCheckResult
{
    return {
        allowed: false,
        enforcer: RULE_CODES.FEATURE,
        service,
        operation,
        data: { feature: 'premium_feature_flag' },
    };
}

function handleComplianceScenario(
    service: string,
    operation: string
): RuleCheckResult
{
    return {
        allowed: false,
        enforcer: RULE_CODES.COMPLIANCE,
        service,
        operation,
        data: { reason: 'account_suspended' },
    };
}
