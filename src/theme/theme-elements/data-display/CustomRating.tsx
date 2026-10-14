/**
 * CustomRating - MUI Rating with theme styling
 *
 * Layer 1: theme-elements wrapper for Material-UI Rating.
 * Applies Modernize theme styling and customization.
 */
import { Rating, type RatingProps } from '@mui/material';

/**
 * Themed Rating component
 *
 * @param props - MUI Rating props
 * @returns Styled Rating component
 */
const CustomRating = ( props: RatingProps ) =>
{
    return <Rating {...props} />;
};

export default CustomRating;
export type { RatingProps };
