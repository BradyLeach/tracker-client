
/**
 * Rule Checker Registry
 *
 * Central registry mapping rule types to their enforcement functions.
 * Mirrors backend checker registry pattern for consistency.
 *
 * Architecture:
 * - RuleEngine loops through rules from RuleRegistry
 * - For each rule type (limit, verification, etc.), looks up checker here
 * - Checker validates and returns RuleCheckResult
 *
 * Extensibility:
 * - Add new checker: import it and add to checkerRegistry object
 * - Or use registerChecker() for dynamic registration (plugins, tests)
 */
import { checkLimit } from './limit.checker';
import { checkVerification } from './verification.checker';
import type { RuleCheckResult, RuleCheckContext } from '../types';
import { logger } from '@/core/utils/logger';

/**
 * Rule checker function signature
 *
 * All checkers must implement this interface:
 * - Accept rule value (type-specific: LimitRule, VerificationRule, etc.)
 * - Accept shared RuleCheckContext
 * - Return Promise<RuleCheckResult> with allowed/blocked decision
 *
 * @param rule - Rule configuration from backend (unknown to allow any rule type)
 * @param context - Check context containing service, operation, user data
 * @returns RuleCheckResult indicating allowed/blocked with enforcement data
 */
type RuleChecker = (
    rule: unknown,
    context: RuleCheckContext
) => Promise<RuleCheckResult>;

/**
 * Registry of rule checkers
 *
 * Maps rule type string to checker function.
 * Order doesn't matter - RuleEngine processes all and returns first failure.
 *
 * Current checkers:
 * - limit: Resource limits (max programs, min balance, etc.)
 * - verification: User verification (age, email, identity)
 *
 * Future checkers (when implemented):
 * - feature: Premium feature access checks
 * - compliance: Data retention, regional compliance rules
 */
const checkerRegistry: Record<string, RuleChecker> = {
    limit: checkLimit,
    verification: checkVerification,
};

/**
 * Get a rule checker by type
 *
 * Used by RuleEngine to resolve checker functions during rule evaluation.
 *
 * @param type - Rule type key ('limit', 'verification', 'feature', 'compliance')
 * @returns Checker function if registered, undefined if unknown type
 *
 * @example
 * ```typescript
 * const checker = getChecker('limit');
 * if (checker) {
 *     const result = await checker(limitRule, context);
 * }
 * ```
 */
export function getChecker( type: string ): RuleChecker | undefined
{
    return checkerRegistry[type];
}

/**
 * Register a custom rule checker
 *
 * Allows dynamic registration of checkers for:
 * - Testing: Inject mock checkers
 * - Plugins: Third-party extensions can add custom rule types
 * - Future enforcers: Add FEATURE/COMPLIANCE checkers when ready
 *
 * @param type - Rule type key (e.g., 'feature', 'compliance')
 * @param checker - Checker function implementing RuleChecker interface
 *
 * @example
 * ```typescript
 * // Register a custom feature checker
 * registerChecker('feature', async (rule, context) => {
 *     // Custom logic here
 *     return { allowed: true, service: context.service, operation: context.operation, data: {} };
 * });
 * ```
 *
 * @warning Overwrites existing checker if type already registered
 */
export function registerChecker( type: string, checker: RuleChecker ): void
{
    if( checkerRegistry[type] )
    {
        logger.warn( 'Checker already registered, overwriting', { type } );
    }
    checkerRegistry[type] = checker;
}