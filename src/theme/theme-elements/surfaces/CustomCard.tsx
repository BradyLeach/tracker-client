
import { Card, type CardProps } from '@mui/material';

/**
 * CustomCard - Theme-element wrapper for MUI Card
 *
 * Provides decoupled Card primitive for content containers.
 * Currently a passthrough wrapper - customize here for app-wide Card behavior.
 */
const CustomCard = ( props: CardProps ) => <Card {...props} />;

export default CustomCard;
