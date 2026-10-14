
import { Link, type LinkProps } from '@mui/material';

/**
 * CustomLink - Theme-element wrapper for MUI Link
 *
 * Provides decoupled Link primitive for navigation and external links.
 * Currently a passthrough wrapper - customize here for app-wide Link behavior.
 */
const CustomLink = ( props: LinkProps ) => <Link {...props} />;

export default CustomLink;
