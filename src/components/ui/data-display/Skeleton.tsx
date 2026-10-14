/**
 * Skeleton - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements
 * Provides stable import surface for app code
 */
import CustomSkeleton, {
    type SkeletonProps as CustomSkeletonProps
} from '@/theme/theme-elements/data-display/CustomSkeleton';

/**
 * Re-exported SkeletonProps for app usage
 */
export type SkeletonProps = CustomSkeletonProps;

/**
 * Skeleton component for app code
 *
 * @param props - Skeleton props
 * @returns Skeleton component
 */
export function Skeleton( props: SkeletonProps )
{
    return <CustomSkeleton {...props} />;
}

export default Skeleton;
