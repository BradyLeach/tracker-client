/**
 * Verification Enforcer
 *
 * Checks verification requirements (age, identity, email).
 * Returns structured data (no UI components).
 *
 * Mirrors backend verification.enforcer.js handler-based architecture.
 */
import type { RuleCheckResult, RuleCheckContext } from '../types';
import { verificationHandlers } from './verificationHandlers';
import { RULE_CODES } from '../ruleCodes';
import { logger } from '@/core/utils/logger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend( utc );

/**
 * Resolves age from context using date of birth
 *
 * @param context - Check context containing userDob
 * @returns Age in full years
 */
function resolveAge( context: RuleCheckContext ): number | undefined
{
    const { userDob } = context;
    if( !userDob ) return undefined;

    const dob = dayjs( userDob as Date | string ).utc();
    const now = dayjs().utc();
    return now.diff( dob, 'year' );
}

/**
 * Extracts all actual verification values from context
 *
 * @param context - Check context containing user data
 * @returns Actual values mapped to rule keys
 */
function resolveActual( context: RuleCheckContext ): Record<string, any>
{
    return {
        age: resolveAge( context ),
        emailVerified: context.emailVerified,
        identityVerificationStatus: context.identityVerificationStatus,
    };
}

/**
 * Checks verification requirements
 *
 * @param verificationRule - Verification rule from RuleRegistry
 * @param context - Check context with user data
 * @returns RuleCheckResult with enforcer code and data
 */
export async function checkVerification(
    verificationRule: unknown,
    context: RuleCheckContext
): Promise<RuleCheckResult>
{

    const { service, operation } = context;

    // No verification rules → allow
    if( !verificationRule || Object.keys( verificationRule ).length === 0 )
    {
        return { allowed: true, service, operation, data: {} };
    }

    try
    {
        const actual = resolveActual( context );

        // Loop over each verification rule
        for( const [key, expected] of Object.entries( verificationRule ) )
        {
            const handler = verificationHandlers[key];

            if( !handler )
            {
                logger.warn( 'Unknown verification key', { key, service, operation } );
                continue;
            }

            const passed = handler( expected, actual );

            if( !passed )
            {
                return {
                    allowed: false,
                    enforcer: RULE_CODES.VERIFICATION,
                    service,
                    operation,
                    specific: key,
                    data: {
                        key,
                        expected,
                        ...actual,
                    },
                };
            }
        }

        // All rules passed
        return { allowed: true, service, operation, data: actual };
    }
    catch ( error )
    {
        logger.error( 'Verification check failed', { service, operation, error } );
        return { allowed: true, service, operation, data: {} };
    }
}
