/**
 * Rule Engine - Orchestration Layer
 *
 * Pure orchestrator that delegates rule checks to registered checkers.
 * NO business logic - just loops through rules and calls the right checker.
 *
 * Architecture (4 layers):
 * 1. RuleEngine (this file) - Orchestrates checks, returns raw data
 * 2. resolveRuleMessage - Translates results to i18n messages
 * 3. useRuleCheck hook - React integration, exposes result.data
 * 4. Parent components - UI decisions (warnings, modals, blocks)
 *
 * Design Principles:
 * - Fail open: No rule = allowed, errors = allowed (availability over enforcement)
 * - Registry-based: Checkers registered in checkerRegistry.ts
 * - Data accumulation: Collects data from all passing checks for parent UI logic
 * - First failure wins: Returns immediately on first blocked check
 */
import type { RuleCheckResult, RuleCheckContext } from './types';
import { ruleRegistry } from './RuleRegistry';
import { getChecker } from './checkers/checkerRegistry';
import { logger } from '@/core/utils/logger';

/**
 * Checks all rules for a service operation
 *
 * Flow:
 * 1. Fetch rules from RuleRegistry (backend bundle)
 * 2. Loop through each rule type (limit, verification, etc.)
 * 3. Get checker from registry, call with rule + context
 * 4. Return first failure OR success with accumulated data
 *
 * Data Accumulation:
 * - Collects data from ALL passing checks into response.data
 * - Example: { limit: { current: 3, max: 10 }, verification: { age: 25 } }
 * - Parent can use this for threshold logic (show warning at 80%)
 *
 * Fail-Open Behavior:
 * - No rules found: allowed (opt-in system)
 * - Unknown rule type: skip with warning (forward compatibility)
 * - Checker errors: handled by checker (see limit.checker.ts)
 *
 * @param service - Service name (e.g., 'program', 'participant')
 * @param operation - Operation type (e.g., 'create', 'delete')
 * @param context - Additional context for checks (userDob, emailVerified, etc.)
 * @returns RuleCheckResult with allowed decision and enforcement data
 *
 * @example Basic usage
 * ```typescript
 * const result = await ruleEngine.check('program', 'create');
 * if (!result.allowed) {
 *   showUpgradeModal(result.enforcer, result.data);
 * }
 * ```
 *
 * @example With context (age verification)
 * ```typescript
 * const result = await ruleEngine.check('identity', 'access', {
 *   userDob: new Date('2010-01-01')
 * });
 * // result.allowed = false
 * // result.enforcer = 'VERIFICATION'
 * // result.specific = 'age'
 * // result.data = { minAge: 18, actualAge: 14 }
 * ```
 *
 * @example Parent using accumulated data for warnings
 * ```typescript
 * const result = await ruleEngine.check('program', 'create');
 * if (result.allowed) {
 *   const { current, max } = result.data.limit || {};
 *   if (current / max >= 0.8) {
 *     showWarning(`You're using ${current} of ${max} program slots`);
 *   }
 * }
 * ```
 */
export async function check(
    service: string,
    operation: string,
    context: Partial<RuleCheckContext> = {}
): Promise<RuleCheckResult>
{
    const fullContext: RuleCheckContext = {
        service,
        operation,
        ...context,
    };

    const response: RuleCheckResult = {
        allowed: true,
        service,
        operation,
        data: {} as Record<string, any>,
    };

    // Get all rules for this service+operation
    const rules = ruleRegistry.getRule( service, operation );

    // No rules - allowed (fail open)
    if( !rules )
    {
        return response;
    }

    // Check each rule through its enforcer
    for( const [type, value] of Object.entries( rules ) )
    {
        const checker = getChecker( type );

        if( !checker )
        {
            logger.warn( 'Unknown rule type', { type, service, operation } );
            continue;
        }

        const result = await checker( value, fullContext );

        if( !result.allowed )
        {
            return result;
        }

        response.data[type] = result.data;
    }

    // All checks passed
    return response;
}

/**
 * RuleEngine singleton
 *
 * Exported as singleton to allow mocking in tests:
 * - Integration tests: Mock ruleEngine.check for deterministic results
 * - Playgrounds: Override ruleEngine.check with simulateRuleCheck
 */
export const ruleEngine = {
    check,
};
