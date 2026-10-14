import { Children, isValidElement, type ReactNode } from 'react';
import { Box, Stack, Typography, type AlertColor } from '@/components/ui';
import { logger } from '@/core/utils/logger';
import { useTranslation } from 'react-i18next';

/**
 * Supported slot types for FormScaffold.
 * Enforces strict ordering: Header → Feedback → Message → Meta → Body → Actions → Footer
 */
type FormSlot = 'header' | 'body' | 'feedback' | 'message' | 'meta' | 'actions' | 'footer';

/**
 * Props for the main FormScaffold component.
 */
interface FormScaffoldProps
{
    children: ReactNode;
}

/**
 * FormScaffold
 *
 * Enterprise form layout contract that owns typography, spacing, and section order.
 * Prevents layout drift by enforcing consistent structure across all forms.
 * Theme handles all responsive behavior - no component-level overrides needed.
 *
 * Usage:
 * ```tsx
 * <FormScaffold>
 *   <FormScaffold.Header title="Register" subtitle="Join our community" />
 *   <FormScaffold.Feedback message={error} severity="error" />
 *   <FormScaffold.Message>
 *     <PromoBanner title="Black Friday Sale!" discount="50%" />
 *   </FormScaffold.Message>
 *   <FormScaffold.Body>
 *     <BaseFormRenderer config={config} onSubmit={onSubmit} />
 *   </FormScaffold.Body>
 *   <FormScaffold.Actions>
 *     <Button type="submit">Register</Button>
 *   </FormScaffold.Actions>
 *   <FormScaffold.Footer>
 *     <AuthFormFooter promptKey="alreadyHaveAccount" />
 *   </FormScaffold.Footer>
 * </FormScaffold>
 * ```
 */
export function FormScaffold( { children }: FormScaffoldProps )
{
    // Collect children by slot type to enforce strict ordering
    const regions: Partial<Record<FormSlot, ReactNode>> = {};

    Children.forEach( children, ( child ) =>
    {
        // Skip non-elements (strings, numbers, null, etc.)
        if( !isValidElement( child ) ) return;

        // @ts-expect-error static marker on compound components
        const slot = child.type?.slot as FormSlot | undefined;
        if( !slot ) return;

        if( import.meta.env.DEV && regions[slot] )
        {
            logger.warn( 'FormScaffold duplicate slot detected; keeping first instance', { slot } );
            return; // keep the original, skip overwrite
        }

        regions[slot] = child;
    } );

    return (
        <Stack gap={3}>
            {regions.header}
            {regions.feedback}
            {regions.message}
            {regions.meta}
            {regions.body}
            {regions.actions}
            {regions.footer}
        </Stack>
    );
};

/**
 * Props for FormScaffold.Header component.
 */
interface FormScaffoldHeaderProps
{
    /** Main header title */
    title?: string;
    /** Optional subtitle/description */
    subtitle?: string;
    /** Optional actions/content for the right side of header */
    actions?: React.ReactNode;
}

/**
 * FormScaffold.Header
 *
 * Standardized form header with consistent typography and spacing.
 * Theme controls all responsive behavior and spacing.
 */
function HeaderImpl( {
    title,
    subtitle,
    actions
}: FormScaffoldHeaderProps )
{
    const { t } = useTranslation();

    if( !title && !subtitle && !actions ) return null;
    return (
        <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
        >
            <Box>
                {title && (
                    <Typography variant="h6">
                        {t( title )}
                    </Typography>
                )}
                {subtitle && (
                    <Typography variant="subtitle1" color="text.secondary" mb={1}>
                        {t( subtitle )}
                    </Typography>
                )}
            </Box>
            {actions && (
                <Box>
                    {actions}
                </Box>
            )}
        </Stack>
    );
}
( HeaderImpl as typeof HeaderImpl & { slot: FormSlot } ).slot = 'header';

/**
 * Props for FormScaffold.Body component.
 */
interface FormScaffoldBodyProps
{
    /** Form content (typically BaseFormRenderer) */
    children: React.ReactNode;
}

/**
 * FormScaffold.Body
 *
 * Container for the main form content. No styling applied -
 * lets the form renderer handle its own field layout.
 */
function BodyImpl( {
    children
}: FormScaffoldBodyProps )
{
    return <Box>{children}</Box>;
}
( BodyImpl as typeof BodyImpl & { slot: FormSlot } ).slot = 'body';

/**
 * Props for FormScaffold.Feedback component.
 */
interface FormScaffoldFeedbackProps
{
    /** Error message to display */
    message?: string;
    severity?: AlertColor;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
}

/**
 * FormScaffold.Error
 *
 * Standardized Feedback display with consistent theming.
 * Only renders if message is provided.
 */
function FeedbackImpl( {
    message,
    severity = 'error',
    align = 'left',
}: FormScaffoldFeedbackProps )
{
    if( !message ) return null;

    return (
        <Box>
            <Typography
                role="alert"
                aria-live={severity === 'error' ? 'assertive' : 'polite'}
                variant="body2"
                sx={( theme ) =>
                {
                    const palette = theme.palette[severity];
                    return {
                        p: 1.5,
                        // `main` is the readable tone against `light` in both
                        // modes. `dark` only works on light backgrounds — in
                        // dark mode `light` is itself a dark tint, so the two
                        // collapse into the same value and the text vanishes.
                        bgcolor: palette.light,
                        color: palette.main,
                        borderRadius: 1,
                        border: 1,
                        borderColor: palette.main,
                        textAlign: align,
                    };
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
( FeedbackImpl as typeof FeedbackImpl & { slot: FormSlot } ).slot = 'feedback';

/**
 * Props for FormScaffold.Message component.
 */
interface FormScaffoldMessageProps
{
    /** Message to display */
    children: React.ReactNode;
}

/**
 * FormScaffold.Message
 *
 * Generic message display for rule violations, promotions, tips, etc.
 * Supports multiple severity levels with appropriate theming.
 */
function MessageImpl( {
    children,
}: FormScaffoldMessageProps )
{
    if( !children ) return null;

    return (
        <Box>
            {children}
        </Box>
    );
};
MessageImpl.slot = 'message';

/**
 * Props for FormScaffold.Actions component.
 */
interface FormScaffoldActionsProps
{
    /** Action buttons/controls */
    children: React.ReactNode;
}

/**
 * FormScaffold.Actions
 *
 * Container for form actions (submit buttons, etc.).
 * Uses theme-controlled spacing between action elements.
 */
function ActionsImpl( {
    children
}: FormScaffoldActionsProps )
{
    return (
        <Stack gap={1.5}>
            {children}
        </Stack>
    );
}
( ActionsImpl as typeof ActionsImpl & { slot: FormSlot } ).slot = 'actions';

/**
 * Props for FormScaffold.Footer component.
 */
interface FormScaffoldFooterProps
{
    /** Footer content (links, additional info, etc.) */
    children: React.ReactNode;
}

/**
 * FormScaffold.Footer
 *
 * Container for form footer content.
 * No additional styling - lets footer content control its own layout.
 */
function FooterImpl( {
    children
}: FormScaffoldFooterProps )
{
    return <Box>{children}</Box>;
}
( FooterImpl as typeof FooterImpl & { slot: FormSlot } ).slot = 'footer';

/**
 * Props for FormScaffold.Meta component.
 */
interface FormScaffoldMetaProps
{
    /** Entity-state content (status chips, verification badges, etc.) */
    children: React.ReactNode;
}

/**
 * FormScaffold.Meta
 *
 * Dedicated slot for entity-state display (status chips, verification badges).
 * Separates persistent entity metadata from transient messages (errors, banners).
 */
function MetaImpl( {
    children
}: FormScaffoldMetaProps )
{
    return <Box>{children}</Box>;
}
( MetaImpl as typeof MetaImpl & { slot: FormSlot } ).slot = 'meta';

// Attach slot implementations to main component
FormScaffold.Header = HeaderImpl;
FormScaffold.Body = BodyImpl;
FormScaffold.Feedback = FeedbackImpl;
FormScaffold.Message = MessageImpl;
FormScaffold.Meta = MetaImpl;
FormScaffold.Actions = ActionsImpl;
FormScaffold.Footer = FooterImpl;

