/**
 * Typography
 *
 * Both families name the intended face first and fall back to the system
 * stack. Until the faces are self-hosted the fallback renders — nothing
 * breaks, but the numerics will not be tabular.
 *
 * `fontFamilyMono` is for figures, identifiers, codes and lot references.
 * Numeric table columns depend on it to hold their alignment.
 *
 * Both stacks end in the platform emoji faces. Text fonts carry no emoji
 * glyphs, so without them user content renders as tofu boxes on any machine
 * whose default font stack has no emoji fallback — Linux most often.
 */
const EMOJI_FALLBACK = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol'";

const typography: any = {
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, ${EMOJI_FALLBACK}`,
    fontFamilyMono: `'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace, ${EMOJI_FALLBACK}`,
    // Anchored to the design. Nothing exceeds 24px and most headings sit
    // between 15px and 20px — the previous scale ran to 36px, which is what
    // made every screen read as a different product.
    h1: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: '2rem',
        letterSpacing: '-0.02em',
    },
    h2: {
        fontWeight: 600,
        fontSize: '1.375rem',
        lineHeight: '1.875rem',
        letterSpacing: '-0.015em',
    },
    h3: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: '1.75rem',
        letterSpacing: '-0.01em',
    },
    h4: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: '1.5rem',
    },
    // Page titles. 20px at normal weight, matching the design's screen title.
    h5: {
        fontWeight: 400,
        fontSize: '1.25rem',
        lineHeight: '1.6rem',
        letterSpacing: '-0.01em',
    },
    // Panel and card titles — the design's detail-panel heading.
    h6: {
        fontWeight: 600,
        fontSize: '0.9375rem',
        lineHeight: '1.3rem',
        letterSpacing: '-0.005em',
    },
    button: {
        textTransform: 'capitalize',
        fontWeight: 400,
    },
    body1: {
        fontSize: '0.8125rem',
        fontWeight: 400,
        lineHeight: '1.25rem',
    },
    body2: {
        fontSize: '0.75rem',
        letterSpacing: '0rem',
        fontWeight: 400,
        lineHeight: '1.125rem',
    },
    subtitle1: {
        fontSize: '0.95rem',
        fontWeight: 400,
    },
    subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 400,
    },
};

export default typography;
