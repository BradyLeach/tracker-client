/**
 * Rating - App UI layer wrapper
 *
 * Layer 2: Thin wrapper over theme-elements.
 * Provides stable import surface for app code.
 */
import CustomRating, {
    type RatingProps as CustomRatingProps,
} from '@/theme/theme-elements/data-display/CustomRating';

export type RatingProps = CustomRatingProps;

export function Rating( props: RatingProps )
{
    return <CustomRating {...props} />;
}

export default Rating;
