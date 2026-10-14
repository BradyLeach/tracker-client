/**
 * SmartLink Component
 *
 * Intelligent link component that automatically handles internal and external navigation
 * without requiring explicit component selection from consumers.
 *
 * **Routing Logic:**
 * - **Internal links** (e.g., `/terms`, `/auth/login`) → Uses react-router-dom Link (no page reload)
 * - **External links** (e.g., `https://example.com`) → Uses MUI Link with target="_blank" (new tab)
 *
 * **Detection:**
 * - URLs starting with `http://` or `https://` are treated as external
 * - All other URLs (starting with `/`) are treated as internal routes
 *
 * **Why This Matters:**
 * - Internal navigation preserves application state (no bootstrap reload)
 * - External links open in new tabs (better UX, security with noopener/noreferrer)
 * - Consumers don't need to know routing implementation details
 *
 * **Important:** SmartLink controls the `component` prop internally. Do NOT pass `component`
 * as a prop - it will override the smart routing logic.
 *
 * @example
 * // Internal route - uses RouterLink (no page reload)
 * <SmartLink href="/terms">Terms and Conditions</SmartLink>
 *
 * @example
 * // External URL - opens in new tab
 * <SmartLink href="https://example.com/privacy">Privacy Rule</SmartLink>
 *
 * @example
 * // With styling props (fully supports Typography props)
 * <SmartLink
 *   href="/help"
 *   fontWeight="500"
 *   variant="h6"
 *   sx={{ textDecoration: 'none', color: 'primary.main' }}
 * >
 *   Help Center
 * </SmartLink>
 *
 * @see FormLabel - Uses SmartLink for label links with Terms & Conditions
 * @see WizardFormRenderer - Uses SmartLink for footer links (e.g., "Already have an account?")
 * @see Playgrounds at src/devTools/playgrounds/links/ for interactive examples
 */

import { Typography, type TypographyProps, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Props for SmartLink component
 *
 * Extends all Typography props except `href` and `onClick` which are redefined for routing and actions.
 */
interface SmartLinkProps extends Omit<TypographyProps<'a'>, 'href' | 'onClick'>
{
    /** URL to navigate to. Internal routes (e.g., "/terms") or external URLs (e.g., "https://example.com"). Optional if onClick is provided. */
    href: string;
    /** Link content (text, elements, etc.) */
    children: ReactNode;
}

/**
 * SmartLink - Intelligent routing link component
 *
 * Automatically determines routing strategy based on href pattern.
 * Handles both internal (react-router) and external (new tab) navigation seamlessly.
 *
 * @param props - SmartLinkProps including href, children, and any Typography props
 * @returns Rendered link with appropriate routing behavior
 */
export function SmartLink( { href, children, ...props }: SmartLinkProps )
{
    // Detect external URLs by protocol prefix (http:// or https://)
    const isExternal = /^https?:\/\//.test( href );

    // Build routing props based on URL type
    const linkProps = isExternal
        ? {
            component: Link, // MUI Link for external URLs
            href, // Standard href attribute
            target: '_blank', // Open in new tab
            rel: 'noopener noreferrer' // Security: prevent window.opener access
        }
        : {
            component: RouterLink, // React Router Link for internal routes
            to: href // React Router's 'to' prop (no page reload)
        };

    return (
        <Typography {...linkProps} {...props} >
            {children}
        </Typography>
    );
}

