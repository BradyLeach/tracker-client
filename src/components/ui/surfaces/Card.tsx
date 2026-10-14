/**
 * Card - App UI component for content containers
 *
 * Thin wrapper over CustomCard (MUI Card + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Card usage.
 *
 * @example
 * ```tsx
 * import { Card } from '@/components/ui/surfaces';
 *
 * <Card>
 *   <CardContent>Content here</CardContent>
 * </Card>
 * ```
 */
import CustomCard from '@/theme/theme-elements/surfaces/CustomCard';
import type { CardProps } from '@mui/material';

export function Card( props: CardProps )
{
    return <CustomCard {...props} />;
}

export default Card;
