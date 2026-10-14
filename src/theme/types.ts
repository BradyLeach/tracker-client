// src/theme/types.ts
import '@mui/material/styles';
import type { Theme, PaletteColor, SimplePaletteColorOptions } from '@mui/material/styles';
import type { THEME, THEME_MODE, THEME_DIRECTION } from '@/core/utils/constants';

/**
 * MUI Theme Type Augmentation
 *
 * Extends Material-UI's built-in theme types to include custom properties
 * that our design system requires beyond MUI's defaults.
 *
 * Why this is needed:
 * - MUI's TypeBackground interface only includes: default, paper, dark (optional)
 * - We've added custom gradient colors to DefaultColors.tsx for our brand
 * - TypeScript needs to know about these custom properties for type safety
 *
 * Pattern:
 * - This is the standard MUI approach for extending theme types
 * - ONE-TIME developer setup - branding team never touches this file
 * - Branding team only edits DefaultColors.tsx to update gradient values
 *
 * Access in components:
 * ```tsx
 * const theme = useTheme();
 * <Box sx={{ background: theme.palette.background.gradient.start }} />
 * ```
 */
declare module '@mui/material/styles' {
  interface TypeBackground {
    /** Custom gradient colors for background animations and decorative elements */
    gradient: {
      start: string;
      middle: string;
      end: string;
    };
    /** Raised surface — cards and panels that sit above `paper` */
    elevated: string;
    /**
     * Recessed surface — table headers, inset fields, search inputs.
     * Sits one step *below* `paper`, not above it.
     */
    sunk: string;
  }

  interface TypeText {
    /** Third-tier text — placeholders, empty values, column headers */
    muted: string;
  }

  interface Palette {
    /**
     * Status chip colors.
     *
     * These extend MUI's built-in set (success/info/warning/error) to cover
     * every category in STATE_CATEGORY_COLORS, and keep MUI's semantics:
     * `main` is the colour, `light` its pale surface. `getStateChipSx`
     * composes a badge from light + main.
     *
     * Declared as full PaletteColor so all four keys are required — MUI reads
     * `dark` and `contrastText` for contained buttons, and a token missing
     * either renders unreadable at runtime without failing the build.
     */
    active: PaletteColor;
    onHold: PaletteColor;
    neutral: PaletteColor;
    muted: PaletteColor;
    danger: PaletteColor;

    /**
     * Structural neutral.
     *
     * The foundation does the structural work: selection, active tabs and
     * active nav are communicated through contrast, weight and border using
     * this neutral — NOT through hue. `primary` is reserved for controls that
     * perform a genuine action (submit, send, confirm).
     *
     * Do not substitute `primary` here. That inversion is the whole design.
     */
    graphite: string;

    /**
     * Line weights. `divider` stays MUI's canonical mid-weight border so
     * built-in components keep working; these are the explicit steps either
     * side of it.
     */
    border: {
      /** Hairline — between data rows, inside dense groupings */
      faint: string;
      /** Default — section edges, table outlines */
      base: string;
      /** Emphasis — header underlines, input outlines, panel separators */
      strong: string;
    };

    /**
     * Row/record selection. Neutral by design — one step deeper than the
     * sunk surface so it reads distinctly from hover, plus a graphite stripe.
     */
    selected: {
      bg: string;
      border: string;
    };

    /**
     * The square behind a record or type icon. Its own token so every tile shares one
     * fill, and a brand accent can restyle them all in one place.
     */
    iconTile: {
      bg: string;
    };

    /** Type tags (partnership types and the like). Inactive text has its own step so it can be tuned alone. */
    tag: {
      inactiveText: string;
    };

    /**
     * Attention signal — computed conditions (low stock, near expiry).
     * A warning, so it keeps real color. Distinct from the `danger` chip,
     * which marks a workflow state that has already gone wrong.
     */
    attn: {
      main: string;
      tint: string;
    };

    /**
     * Navigation rail surface.
     *
     * Stays near-black in both modes — the rail is a fixed anchor the content
     * sits beside, not a surface that follows the theme. Only its own shade
     * shifts between light and dark.
     *
     * Active state is background + full-white label + a neutral stripe. No
     * hue, same rule as every other selected state in the app.
     */
    sidebar: {
      /** Rail background */
      bg: string;
      /** Inactive item label and icon */
      text: string;
      /** Active item background */
      activeBg: string;
      /** Active item stripe */
      activeBorder: string;
    };

    /**
     * Purpose-built tokens for GroupedDataTable hierarchy.
     * Each theme defines explicit values so parent/child separation
     * works correctly regardless of base surface color.
     */
    groupedTable: {
      /** Table wrapper background */
      containerBg: string;
      /** Outer column header row (COMPANY / STATUS) */
      headerBg: string;
      /** Collapsed company row — typically transparent, sits on table surface */
      parentBg: string;
      /** Expanded company row — must differ visibly from parentBg */
      parentBgExpanded: string;
      /** Wrapper behind the nested child block */
      childContainerBg: string;
      /** Nested column headers (TYPE, CONTACT NAME, etc) */
      childHeaderBg: string;
      /** Partnership data rows — must lift clearly above parentBgExpanded */
      childRowBg: string;
      /** Hover state for both parent and child rows */
      rowHoverBg: string;
      /** All borders in the grouped table */
      border: string;
    };
  }

  interface PaletteOptions {
    active?: SimplePaletteColorOptions;
    onHold?: SimplePaletteColorOptions;
    neutral?: SimplePaletteColorOptions;
    muted?: SimplePaletteColorOptions;
    danger?: SimplePaletteColorOptions;
    graphite?: string;
    border?: {
      faint?: string;
      base?: string;
      strong?: string;
    };
    selected?: {
      bg?: string;
      border?: string;
    };
    iconTile?: {
      bg?: string;
    };
    tag?: {
      inactiveText?: string;
    };
    attn?: {
      main?: string;
      tint?: string;
    };
    sidebar?: {
      bg?: string;
      text?: string;
      activeBg?: string;
      activeBorder?: string;
    };
    groupedTable?: {
      containerBg?: string;
      headerBg?: string;
      parentBg?: string;
      parentBgExpanded?: string;
      childContainerBg?: string;
      childHeaderBg?: string;
      childRowBg?: string;
      rowHoverBg?: string;
      border?: string;
    };
  }

  interface TypographyVariants {
    /** Monospace family for numerics, identifiers, codes and lot references */
    fontFamilyMono: string;
  }

  interface TypographyVariantsOptions {
    fontFamilyMono?: string;
  }
}

/**
 * Theme configuration state
 *
 * Contains the compiled MUI theme and all theme-related settings.
 * Used by the application to apply consistent theming across all components.
 */
export interface ThemeConfig {
    /** Compiled MUI theme instance */
    theme: Theme;
    /** Active theme color variant (e.g., 'cyan', 'blue') */
    themeName: typeof THEME[keyof typeof THEME];
    /** Color mode - light or dark */
    mode: typeof THEME_MODE[keyof typeof THEME_MODE];
    /** Text direction for internationalization */
    direction: typeof THEME_DIRECTION[keyof typeof THEME_DIRECTION];
    /** Border radius in pixels applied globally */
    borderRadius: number;
}

/**
 * Theme build configuration options
 * All properties are optional - BuildTheme will use config defaults as fallback
 */
export interface ThemeBuildConfig {
    /** Theme color variant */
    theme?: typeof THEME[keyof typeof THEME];
    /** Color mode - light or dark */
    mode?: typeof THEME_MODE[keyof typeof THEME_MODE];
    /** Text direction for internationalization */
    direction?: typeof THEME_DIRECTION[keyof typeof THEME_DIRECTION];
    /** Border radius in pixels */
    borderRadius?: number;
}