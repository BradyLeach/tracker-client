/**
 * Limit Enforcer
 *
 * Checks resource limits (min/max) against current usage.
 * Returns structured data (no UI components).
 *
 * Mirrors backend limit.enforcer.js handler-based architecture.
 */
import { limitHandlers, type LimitRule } from './limitHandlers';
import { RULE_CODES } from '../ruleCodes';
import { dataService } from '@/services/dataService/dataService';
import { logger } from '@/core/utils';

import type { RuleCheckResult, RuleCheckContext } from '../types';

/**
 * Checks if user has exceeded resource limits
 *
 * @param limitRule - Limit rule from RuleRegistry
 * @param context - Check context with service/operation info
 * @returns RuleCheckResult with enforcer code and data
 */
export async function checkLimit(
    limitRule: unknown,
    context: RuleCheckContext
): Promise<RuleCheckResult>
{
    const rule = limitRule as LimitRule;
    const { service, operation } = context;
    const { max, min } = rule;

    // No limits defined - nothing to enforce
    if( !max && !min )
    {
        return {
            allowed: true,
            service,
            operation,
            data: {},
        };
    }

    try
    {
        const metadata = await dataService.getMetadata( service );

        const actual = { current: metadata.total };

        // Loop over each limit rule
        for( const [key, expected] of Object.entries( rule ) )
        {
            const handler = limitHandlers[key as keyof typeof limitHandlers];

            if( !handler )
            {
                logger.warn( 'Unknown limit key', { key, service, operation } );
                continue;
            }

            const passed = handler( expected, actual );

            if( !passed )
            {
                return {
                    allowed: false,
                    enforcer: RULE_CODES.LIMIT,
                    service,
                    operation,
                    specific: key,
                    data: {
                        key,
                        ...rule,
                        current: actual.current,
                        accountTypeLevel: 0, // TODO: Get from user context
                    },
                };
            }
        }

        // All rules passed
        return {
            allowed: true,
            service,
            operation,
            data: {
                ...actual,
                ...rule,
            },
        };
    }
    catch ( error )
    {
        // Fail open - allow operation if we can't check
        logger.error( 'Limit check failed', { service, error } );
        return {
            allowed: true,
            service,
            operation,
            data: {},
        };
    }
}
