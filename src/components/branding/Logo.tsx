import { SmartLink } from '@/components/shared/links/SmartLink';

// Single colour-agnostic mark. Every element draws in currentColor, so the
// variant below is the only thing that decides how the logo looks.
import LogoMark from '@/assets/logos/plan-make-trace-mark.svg?react';

/**
 * Colour treatments defined in `src/index.css`.
 *
 * - `brand` — primary standalone mark (#009EBE)
 * - `reversed` — white, for dark or coloured backgrounds
 * - `mono` — charcoal/black, for single-colour reproduction
 * - `inherit` — takes the colour of its container
 */
export type LogoVariant = 'brand' | 'reversed' | 'mono' | 'inherit';

const VARIANT_CLASS: Record<LogoVariant, string> = {
    brand: '',
    reversed: 'pmt-logo--reversed',
    mono: 'pmt-logo--mono',
    inherit: 'pmt-logo--inherit',
};

/**
 * Props for Logo
 *
 * @property {boolean} [disableLink] - Render the mark on its own, without the
 * link to home. Used on the home page itself, where the link is a self-reference.
 * @property {number} [height] - Rendered height of the mark in pixels.
 * @property {LogoVariant} [variant] - Colour treatment to apply.
 */
interface LogoProps
{
    disableLink?: boolean;
    height?: number;
    variant?: LogoVariant;
}

/**
 * The Plan Make Trace mark.
 *
 * Colour comes from CSS only — pick a `variant`, or override
 * `--pmt-logo-color` on any ancestor for a one-off treatment.
 *
 * @returns The mark, wrapped in a SmartLink to home unless disabled
 */
export function Logo( { disableLink, height = 40, variant = 'brand' }: LogoProps = {} )
{
    const mark = (
        <LogoMark
            role="img"
            aria-label="Plan Make Trace"
            className={`pmt-logo ${VARIANT_CLASS[variant]}`.trim()}
            style={{ height, width: height }}
        />
    );

    if( disableLink )
    {
        return mark;
    }

    return (
        <SmartLink href="/" sx={{ display: 'flex', alignItems: 'center', }}>
            {mark}
        </SmartLink>
    );
}

export default Logo;
