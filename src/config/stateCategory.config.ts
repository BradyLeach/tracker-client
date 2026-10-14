/**
 * MUI Chip color values — defined here to avoid importing from the UI layer.
 * Must stay in sync with MUI ChipProps['color'].
 */
export type ChipColor =
    | 'neutral'
    | 'active'
    | 'onHold'
    | 'warning'
    | 'success'
    | 'muted'
    | 'danger';

export interface StateCategoryConfig
{
    terminalLabel: string;
    color: ChipColor;
}

const FALLBACK: StateCategoryConfig = {
    terminalLabel: 'Done',
    color: 'neutral',
};

/**
 * Color for every state category.
 * Mirrors bootstrap/data/stateCategory.js — keep in sync.
 * Used by StatusChip and anywhere a category name must resolve to a chip colour.
 */
export const STATE_CATEGORY_COLORS: Record<string, ChipColor> = {
    new: 'neutral',
    active: 'active',
    on_hold: 'onHold',
    stalled: 'warning',
    complete: 'success',
    cancelled: 'muted',
    failed: 'danger',
};

/**
 * Terminal state categories only — drives the sublabel in the state graph bar viewer.
 * Non-terminal categories (new, active, on_hold, stalled) are not listed here.
 */
export const STATE_CATEGORY_CONFIG: Record<string, StateCategoryConfig> = {
    complete: { terminalLabel: 'Done', color: 'success' },
    cancelled: { terminalLabel: 'Cancelled', color: 'muted' },
    failed: { terminalLabel: 'Failed', color: 'danger' },
};

export function getStateCategoryConfig( name: string ): StateCategoryConfig
{
    return STATE_CATEGORY_CONFIG[name] ?? FALLBACK;
}

/**
 * Returns true if the given state category name represents an actively
 * in-progress state. Intentionally uses the category name, not color —
 * color is a visual property and must not drive business logic.
 */
export function isActiveStateCategory( categoryName: string | undefined ): boolean
{
    return categoryName === 'active';
}

/**
 * Returns sx overrides for state chips.
 *
 * Tokens follow standard MUI semantics: `main` is the colour itself, `light`
 * is its pale surface. The chip uses main for the label and light for the
 * fill, with the outline matching the fill — a status is filled, which keeps
 * it apart from outlined tags. Do not repurpose `main` as a border-only tone — MUI's own
 * components (button labels, alerts, helper text, icons) read it as the
 * colour, and they wash out if it holds a pale value.
 */
export function getStateChipSx( color?: string )
{
    const colourToken = color || 'neutral';

    return {
        bgcolor: `${colourToken}.light`,
        color: `${colourToken}.main`,
        border: '1px solid',
        borderColor: `${colourToken}.light`,
        fontWeight: 500,
        fontSize: '0.6875rem',
        letterSpacing: 'normal',
        textTransform: 'none' as const,
        borderRadius: '4px',
        height: 'auto',
        '& .MuiChip-label': { padding: '2.5px 8px' },
    };
}
