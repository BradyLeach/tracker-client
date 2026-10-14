/**
 * Link - App UI component for navigation and external links
 *
 * Thin wrapper over CustomLink (MUI Link + Modernize theme).
 * Provides stable import surface and future-proofing for app-wide Link usage.
 *
 * @example
 * ```tsx
 * import { Link } from '@/components/ui/inputs';
 *
 * <Link href="/about">About Us</Link>
 * ```
 */
import CustomLink from '@/theme/theme-elements/inputs/CustomLink';
import type { LinkProps } from '@mui/material';

export function Link( props: LinkProps )
{
    return <CustomLink {...props} />;
}

export default Link;
