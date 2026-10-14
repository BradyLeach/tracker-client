/**
 * Rule Message Resolver
 *
 * Single source of truth for resolving rule violation messages.
 * Uses hierarchical key lookup with fallbacks for maximum flexibility.
 *
 * Design principles:
 * - Pure function (no side effects)
 * - Hierarchical fallback (specific → generic)
 * - Leverages rich rule data for interpolation
 * - Type-safe with full TypeScript support
 */

import i18n from '@/utils/i18n';
import type { RuleCode } from './ruleCodes';

/**
 * Resolved rule message with metadata
 */
export interface RuleMessage
{
    /**
     * The i18n key that was resolved (for debugging/logging)
     */
    key: string;

    /**
     * The translated title
     */
    title: string;

    /**
     * The translated description
     */
    description: string;

    /**
     * The translated action button text
     */
    action: string;
}

/**
 * Parameters for message interpolation
 * Includes all data from RuleCheckResult.data plus service/operation
 */
export type RuleMessageParams = Record<string, string | number>;

/**
 * Resolves rule violation messages using hierarchical i18n key lookup
 *
 * Key resolution hierarchy (most specific to most general):
 * 1. rule.{enforcer}.{severity}.{service}.{specific}
 * 2. rule.{enforcer}.{severity}.{service}
 * 3. rule.{enforcer}.{severity}
 * 4. rule.{enforcer}.generic
 * 5. rule.generic (ultimate fallback)
 *
 * @param enforcer - Rule enforcer code (LIMIT, VERIFICATION, etc.)
 * @param severity - UI severity level (block, warning, info)
 * @param service - Service name (program, participant, etc.)
 * @param specific - Specific subtype (age, email, retention, etc.)
 * @param params - Data for message interpolation (current, max, minAge, etc.)
 * @returns Resolved message with title, description, action
 *
 * @example
 * ```ts
 * // LIMIT enforcer with program service
 * resolveRuleMessage('LIMIT', 'block', 'program', undefined, {
 *   current: 5,
 *   max: 5,
 *   service: 'program'
 * });
 * // → { key: 'rule.LIMIT.block.program', title: '...', description: '...', action: '...' }
 *
 * // VERIFICATION enforcer with age check
 * resolveRuleMessage('VERIFICATION', 'block', 'program', 'age', {
 *   minAge: 18,
 *   actualAge: 16,
 *   service: 'program',
 *   operation: 'create'
 * });
 * // → { key: 'rule.VERIFICATION.block.age', title: '...', description: '...', action: '...' }
 * ```
 */
export function resolveRuleMessage(
    enforcer: RuleCode,
    severity: 'block' | 'warning' | 'info',
    service?: string,
    specific?: string,
    params?: RuleMessageParams
): RuleMessage
{
    // Build hierarchical key candidates (most specific to most general)
    const keys: string[] = [];

    if( service && specific )
    {
        keys.push( `rule.${enforcer}.${severity}.${service}.${specific}` );
    }
    if( specific )
    {
        keys.push( `rule.${enforcer}.${severity}.${specific}` );
    }
    if( service )
    {
        keys.push( `rule.${enforcer}.${severity}.${service}` );
    }
    keys.push( `rule.${enforcer}.${severity}` );
    keys.push( `rule.${enforcer}.generic` );
    keys.push( 'rule.generic' );

    // Find first existing key
    let resolvedKey = 'rule.generic';
    for( const key of keys )
    {
        if( i18n.exists( `${key}.title` ) )
        {
            resolvedKey = key;
            break;
        }
    }

    // Resolve title, description, action
    const title = i18n.t( `${resolvedKey}.title`, params || {} );
    const description = i18n.t( `${resolvedKey}.description`, params || {} );
    const action = i18n.t( `${resolvedKey}.action`, params || {} );

    return {
        key: resolvedKey,
        title,
        description,
        action,
    };
}

/**
 * Helper to extract message params from RuleCheckResult
 *
 * Combines service, operation, and all data fields into a flat object
 * suitable for i18n interpolation.
 *
 * @param result - Rule check result from RuleEngine
 * @returns Flat params object for message interpolation
 *
 * @example
 * ```ts
 * const result = {
 *   allowed: false,
 *   enforcer: 'LIMIT',
 *   service: 'program',
 *   operation: 'create',
 *   data: { current: 5, max: 5 }
 * };
 *
 * extractRuleParams(result);
 * // → { service: 'program', operation: 'create', current: 5, max: 5 }
 * ```
 */
export function extractRuleParams( result: {
    service: string;
    operation: string;
    data: Record<string, unknown>;
} ): RuleMessageParams
{
    return {
        service: result.service,
        operation: result.operation,
        ...( result.data as RuleMessageParams ),
    };
}
