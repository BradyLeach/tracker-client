import { useEffect, useState, useRef } from 'react';
import type { RuleCheckContext, RuleCheckResult } from '@/core/businessRules/types';
import { ruleEngine } from '@/core/businessRules/RuleEngine';
import { logger } from '@/core/utils/logger';

export interface UseRuleCheckOptions
{
    service: string;
    operation: string;
    context?: Partial<RuleCheckContext>;
    onResolved?: ( result: RuleCheckResult ) => void;
}

export interface UseRuleCheckResult
{
    isLoading: boolean;
    allowed: boolean | null;
    result: RuleCheckResult | null;
}

/**
 * Pure rule orchestration hook.
 *
 * Calls RuleEngine and emits onResolved event.
 * NO UI decisions - caller handles all presentation.
 *
 * @example
 * const { isLoading, allowed, result } = useRuleCheck({
 *     service: 'program',
 *     operation: 'create',
 * });
 *
 * const showWarning = result?.data.current >= result?.data.max * 0.8;
 */
export function useRuleCheck( options: UseRuleCheckOptions ): UseRuleCheckResult
{
    const { service, operation, context = {}, onResolved } = options;
    const [result, setResult] = useState<RuleCheckResult | null>( null );
    const onResolvedRef = useRef( onResolved );
    onResolvedRef.current = onResolved;

    useEffect( () =>
    {
        async function check()
        {
            try
            {
                const res = await ruleEngine.check( service, operation, context );
                setResult( res );
                onResolvedRef.current?.( res );
            }
            catch ( err )
            {
                logger.error( 'useRuleCheck failed', { service, operation, err } );

                const fallback: RuleCheckResult = {
                    allowed: true,
                    service,
                    operation,
                    data: {},
                };
                setResult( fallback );
                onResolvedRef.current?.( fallback );
            }
        }

        check();
    }, [service, operation, JSON.stringify( context )] );

    return {
        isLoading: result === null,
        allowed: result?.allowed ?? null,
        result,
    };
}