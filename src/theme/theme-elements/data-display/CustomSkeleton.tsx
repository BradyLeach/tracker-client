/**
 * CustomSkeleton - MUI Skeleton with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Skeleton
 * Applies Modernize theme styling and customization
 */
import { Skeleton, type SkeletonProps } from '@mui/material';

/**
 * Themed Skeleton component
 *
 * @param props - MUI Skeleton props
 * @returns Styled Skeleton component
 */
const CustomSkeleton = ( props: SkeletonProps ) =>
{
    return <Skeleton {...props} />;
};

export default CustomSkeleton;
export type { SkeletonProps };
