import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui';
import { useRuleCheck, type UseRuleCheckOptions } from './useRuleCheck';

export interface RuleGateProps extends UseRuleCheckOptions
{
    /** Child nodes wrapped by the guard */
    children?: ReactNode;

    /** Optional loading fallback (default: Skeleton with height 200) */
    loadingFallback?: ReactNode;
}

/**
 * Conditional rendering gate using rule checks.
 *
 * For simple show/hide cases. For complex UI (warnings, modals, progress),
 * use useRuleCheck directly.
 *
 * @example
 * <RuleGate service="program" operation="advancedFeature">
 *     <Button>Advanced Feature</Button>
 * </RuleGate>
 */
export function RuleGate( props: RuleGateProps )
{
    const {
        children,
        loadingFallback = <Skeleton variant="rectangular" height={200} />,
        ...opts
    } = props;

    const { isLoading, allowed } = useRuleCheck( opts );

    if( isLoading ) return <>{loadingFallback}</>;
    return allowed ? <>{children}</> : null;
}