import type { ThemeOptions } from '@mui/material/styles';

/**
 * Base Theme Colors
 *
 * The only source of colour in the app. There are two themes — light and
 * dark — and nothing layers on top of them. Both are ported directly from
 * the inventory design.
 *
 * Design premise:
 * Structure is carried by neutrals, not by hue. Selection, active rows,
 * table hierarchy and borders all resolve through the stone ramp and
 * `graphite`. `primary` is reserved for controls that perform a genuine
 * action. Color is spent only where it carries meaning — status.
 *
 * Chip tokens (neutral, active, onHold, muted, danger) extend MUI's built-in
 * set and keep its semantics: `main` is the colour itself, `light` its pale
 * surface. getStateChipSx composes a badge from light + main.
 *
 * `main` must never hold a border-only tone — MUI reads it as the colour for
 * button labels, alerts, helper text and icons, all of which wash out.
 *
 * In dark mode `light` is a dark tint rather than a lighter shade, since a
 * pale surface is what recedes on a dark ground.
 *
 * Both objects are typed as ThemeOptions so a token defined in one mode
 * and missing from the other fails the build rather than resolving to
 * nothing at runtime.
 */
const baseLightTheme: ThemeOptions = {
    direction: 'ltr',
    palette: {
        // Action color — buttons, links, focus. Not used for structure.
        primary: {
            main: '#355F97',
            light: '#EAF0F7',
            dark: '#294A76',
            contrastText: '#ffffff',
        },
        // Graphite family — the structural neutral in palette form.
        secondary: {
            main: '#46453D',
            light: '#EFEEE7',
            dark: '#2E2D28',
            contrastText: '#ffffff',
        },

        // ── Status chips ──────────────────────────────────────────────
        // new / unverified — ordinary, stays neutral
        neutral: {
            main: '#6E6D66',
            light: '#F4F3EF',
            dark: '#52514B',
            contrastText: '#FFFFFF',
        },

        // in progress — the one hue the design permits, kept desaturated
        active: {
            main: '#355F97',
            light: '#EAF0F7',
            dark: '#294A76',
            contrastText: '#FFFFFF',
        },

        // paused deliberately — deeper stone, reads as parked not broken
        onHold: {
            main: '#46453D',
            light: '#EFEEE7',
            dark: '#2E2D28',
            contrastText: '#FFFFFF',
        },

        // stalled — a real warning, keeps color
        warning: {
            main: '#96702E',
            light: '#FCEEDA',
            dark: '#74561F',
            contrastText: '#FFFFFF',
        },

        // complete — positive/finished
        success: {
            main: '#3F7A52',
            light: '#EAF3EC',
            dark: '#2F5C3E',
            contrastText: '#FFFFFF',
        },

        // cancelled — quietest of the neutrals, faded rather than alarming
        muted: {
            main: '#9E9C93',
            light: '#F4F3EF',
            dark: '#6B6A63',
            contrastText: '#FFFFFF',
        },

        // failed — genuinely problematic, stays saturated
        danger: {
            main: '#A83A32',
            light: '#FBEAE9',
            dark: '#832C26',
            contrastText: '#FFFFFF',
        },

        // aligned with danger — same meaning, MUI's built-in name
        error: {
            main: '#A83A32',
            light: '#FBEAE9',
            dark: '#832C26',
            contrastText: '#FFFFFF',
        },

        // informational — shares the action hue
        info: {
            main: '#355F97',
            light: '#EAF0F7',
            dark: '#294A76',
            contrastText: '#FFFFFF',
        },

        // ── Structure ─────────────────────────────────────────────────
        /**
         * Carries selection, active tabs and active nav.
         * Never substitute primary here — that inversion is the design.
         */
        graphite: '#46453D',

        selected: {
            bg: '#EFEEE7',
            border: '#DAD8CE',
        },

        // A clear step on a white row, without reading as a selection.
        iconTile: {
            bg: '#F1F0EA',
        },

        // A step darker than text.muted, so an inactive tag stays legible on a white row.
        tag: {
            inactiveText: '#8C8A81',
        },

        /** Computed conditions — low stock, nearing expiry. */
        attn: {
            main: '#96702E',
            tint: '#FCEEDA',
        },

        // Navigation rail — near-black in both modes by design.
        sidebar: {
            bg: '#16160F',
            text: 'rgba(255, 255, 255, 0.5)',
            activeBg: 'rgba(255, 255, 255, 0.08)',
            activeBorder: 'rgba(255, 255, 255, 0.4)',
        },

        // ── Neutrals ──────────────────────────────────────────────────
        // Warm stone ramp — 50 lightest through 600 darkest.
        grey: {
            50: '#FAFAF9',
            100: '#F6F6F4',
            200: '#ECEBE5',
            300: '#DEDCD3',
            400: '#9E9C93',
            500: '#6B6A63',
            600: '#46453D',
        },

        text: {
            primary: '#171713',
            secondary: '#6B6A63',
            muted: '#9E9C93',
        },

        border: {
            faint: '#F0EFE9',
            base: '#ECEBE5',
            strong: '#DEDCD3',
        },

        divider: '#ECEBE5',

        action: {
            hover: 'rgba(23, 23, 19, 0.04)',
            disabledBackground: 'rgba(23, 23, 19, 0.08)',
            hoverOpacity: 0.04,
        },

        background: {
            default: '#FAFAF9',
            paper: '#FFFFFF',
            elevated: '#FFFFFF', // cards sit flush — no grey card surface
            sunk: '#F6F6F4', // table headers, inset fields
            gradient: {
                start: 'rgba(70, 69, 61, 0.05)',
                middle: 'rgba(53, 95, 151, 0.06)',
                end: 'rgba(70, 69, 61, 0.03)',
            },
        },

        // ── Grouped table ─────────────────────────────────────────────
        // Layering: child rows must lift above the expanded parent,
        // which must in turn read as recessed against the collapsed row.
        groupedTable: {
            containerBg: '#FFFFFF',
            headerBg: '#F6F6F4',

            parentBg: '#FFFFFF',
            parentBgExpanded: '#F6F6F4',

            childContainerBg: '#FFFFFF',
            childHeaderBg: '#F6F6F4',
            childRowBg: '#FFFFFF',

            rowHoverBg: '#F6F6F4',
            border: '#ECEBE5',
        },
    },
};

const baseDarkTheme: ThemeOptions = {
    direction: 'ltr',
    palette: {
        // `light` is a dark tint in this mode. Components.tsx uses it only as a
        // hover background (MuiIconButton, MuiButton text/outlined variants),
        // so it must sit just above the surface — a lighter shade renders as a
        // solid bright block on hover.
        primary: {
            main: '#5C84B8',
            light: '#222C38',
            dark: '#3E6591',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#B7B4A6',
            light: '#33322C',
            dark: '#8F8C80',
            contrastText: '#1C1B18',
        },

        // ── Status chips ──────────────────────────────────────────────
        // In dark mode `light` is a dark tint — it is the chip fill,
        // not a lighter shade. See the convention note above.
        neutral: {
            main: '#ABA898',
            light: '#2E2D28',
            dark: '#5C5A52',
            contrastText: '#FFFFFF',
        },

        active: {
            main: '#8FB0D8',
            light: '#222C38',
            dark: '#3E6591',
            contrastText: '#FFFFFF',
        },

        onHold: {
            main: '#B7B4A6',
            light: '#33322C',
            dark: '#5F5D54',
            contrastText: '#FFFFFF',
        },

        warning: {
            main: '#D9A74A',
            light: '#3A2F1B',
            dark: '#8A6A28',
            contrastText: '#FFFFFF',
        },

        success: {
            main: '#7FBB90',
            light: '#223229',
            dark: '#3F7A52',
            contrastText: '#FFFFFF',
        },

        muted: {
            main: '#8E8B80',
            light: '#2E2D28',
            dark: '#55534C',
            contrastText: '#FFFFFF',
        },

        danger: {
            main: '#E08F86',
            light: '#3A2523',
            dark: '#A83A32',
            contrastText: '#FFFFFF',
        },

        error: {
            main: '#E08F86',
            light: '#3A2523',
            dark: '#A83A32',
            contrastText: '#FFFFFF',
        },

        info: {
            main: '#8FB0D8',
            light: '#222C38',
            dark: '#3E6591',
            contrastText: '#FFFFFF',
        },

        // ── Structure ─────────────────────────────────────────────────
        graphite: '#B7B4A6',

        selected: {
            bg: '#33322C',
            border: '#4A4840',
        },

        // A clear lift on the paper surface, below the selected step.
        iconTile: {
            bg: '#302F2A',
        },

        tag: {
            inactiveText: '#8E8B80',
        },

        attn: {
            main: '#D9A74A',
            tint: '#3A2F1B',
        },

        // Navigation rail — one shade deeper than light mode.
        sidebar: {
            bg: '#111110',
            text: 'rgba(255, 255, 255, 0.5)',
            activeBg: 'rgba(255, 255, 255, 0.08)',
            activeBorder: 'rgba(255, 255, 255, 0.35)',
        },

        // ── Neutrals ──────────────────────────────────────────────────
        // Warm stone ramp — 50 darkest through 600 lightest.
        grey: {
            50: '#232220',
            100: '#2A2926',
            200: '#302F2A',
            300: '#38372F',
            400: '#454339',
            500: '#75726A',
            600: '#A8A599',
        },

        text: {
            primary: '#EDEAE2',
            secondary: '#A8A599',
            muted: '#8E8B80',
        },

        border: {
            faint: '#302F2A',
            base: '#38372F',
            strong: '#454339',
        },

        divider: '#38372F',

        action: {
            hover: 'rgba(255, 255, 255, 0.04)',
            disabledBackground: 'rgba(255, 255, 255, 0.08)',
            hoverOpacity: 0.06,
        },

        background: {
            default: '#1C1B18',
            paper: '#232220',
            elevated: '#302F2A', // raised — reads lighter in dark
            sunk: '#2A2926', // recessed also reads lighter, one step less
            gradient: {
                start: 'rgba(183, 180, 166, 0.07)',
                middle: 'rgba(92, 132, 184, 0.09)',
                end: 'rgba(183, 180, 166, 0.04)',
            },
        },

        // ── Grouped table ─────────────────────────────────────────────
        groupedTable: {
            containerBg: '#232220',
            headerBg: '#2A2926',

            parentBg: '#232220',
            parentBgExpanded: '#2A2926',

            childContainerBg: '#1C1B18',
            childHeaderBg: '#2A2926',
            childRowBg: '#232220',

            rowHoverBg: 'rgba(255, 255, 255, 0.04)',
            border: '#38372F',
        },
    }
};

export { baseDarkTheme, baseLightTheme };
