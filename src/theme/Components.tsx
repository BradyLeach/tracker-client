// project imports
import './DefaultColors';
import type { Theme, Components } from '@mui/material/styles';
import type { } from '@mui/lab/themeAugmentation';

const components = ( theme: Theme ): Components =>
{
    return {
        MuiCssBaseline: {
            styleOverrides: {
                // The realtime trace's motion lives in index.css; its colour is the
                // theme's, so the class never hard-codes one.
                ':root': {
                    '--realtime-trace-colour': theme.palette.info.main,
                },
                '*': {
                    boxSizing: 'border-box',
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.border.strong} ${theme.palette.background.sunk}`,
                },
                html: {
                    height: '100%',
                    width: '100%',
                },
                a: {
                    textDecoration: 'none',
                },
                body: {
                    height: '100%',
                    margin: 0,
                    padding: 0,
                },

                // Scrollbars follow the theme. `scrollbar-color` is the standard
                // property; the -webkit- block covers Safari and Chrome before
                // 121, which ignore it. Both read the same tokens, so light and
                // dark stay in step.
                '*::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                },
                '*::-webkit-scrollbar-track': {
                    backgroundColor: theme.palette.background.sunk,
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.border.strong,
                    borderRadius: 8,
                    // Inset the thumb so it reads as a pill rather than filling
                    // the gutter edge to edge.
                    border: `2px solid ${theme.palette.background.sunk}`,
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: theme.palette.text.secondary,
                },
                '*::-webkit-scrollbar-corner': {
                    backgroundColor: theme.palette.background.sunk,
                },
                '.ql-container.ql-snow, .ql-toolbar.ql-snow': {
                    border: '0 !important', borderRadius: '7px'
                },
                '.ql-editor, .ql-snow *': {
                    fontFamily: 'inherit !important'
                },
                '#root': {
                    height: '100%',
                },
                "*[dir='rtl'] .buyNowImg": {
                    transform: 'scaleX(-1)',
                },
                '.border-none': {
                    border: '0px',
                    td: {
                        border: '0px',
                    },
                },
                'pre': {
                    background: `${theme.palette.grey[100]} !important`,
                },
                '.btn-xs': {
                    minWidth: '30px !important',
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px !important',
                    padding: '0px !important',
                },
                '.hover-text-primary:hover .text-hover': {
                    color: theme.palette.primary.main,
                },
                '.hoverCard:hover': {
                    scale: '1.01',
                    transition: ' 0.1s ease-in',
                },
                '.signup-bg': {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: '100%',
                },
                /* No blanket radius on Box. It is a layout primitive with no
                   visual identity of its own — a global rounding here reaches
                   every full-bleed surface in the app, including the nav rail,
                   and has to be fought off case by case. Components that want
                   a radius set it themselves. */
                '.MuiCardHeader-action': {
                    alignSelf: 'center !important',
                },
                '.emoji-picker-react .emoji-scroll-wrapper': {
                    overflowX: 'hidden',
                },
                '.scrollbar-container': {
                    borderRight: '0 !important',
                },
                '.theme-timeline .MuiTimelineOppositeContent-root': {
                    minWidth: '90px',
                },
                '.MuiAlert-root .MuiAlert-icon': {
                    color: 'inherit!important',
                },
                '.MuiTimelineConnector-root': {
                    width: '1px !important',
                },
                ' .simplebar-scrollbar:before': {
                    background: `${theme.palette.grey[300]} !important`,
                },
                '@keyframes gradient': {
                    '0%': {
                        backgroundPosition: '0% 50%',
                    },
                    '50%': {
                        backgroundPosition: ' 100% 50%',
                    },
                    '100% ': {
                        backgroundPosition: ' 0% 50%',
                    },
                },
                '@keyframes slide': {
                    '0%': {
                        transform: 'translate3d(0, 0, 0)',
                    },
                    '100% ': {
                        transform: 'translate3d(-2086px, 0, 0)',
                    },
                },
                "@keyframes marquee": {
                    "0%": {
                        transform: "translateZ(0)",
                    },
                    "100%": {
                        transform: "translate3d(-2086px,0,0)",
                    },
                },
                "@keyframes marquee2": {
                    "0%": {
                        transform: "translate3d(-2086px,0,0)",
                    },
                    "100%": {
                        transform: "translateZ(0)",
                    },
                },
                "@keyframes marqueeRtl": {
                    "0%": {
                        transform: "translateZ(0)",
                    },
                    "100%": {
                        transform: "translate3d(2086px,0,0)",
                    },
                },
                "@keyframes marquee2Rtl": {
                    "0%": {
                        transform: "translate3d(2086px,0,0)",
                    },
                    "100%": {
                        transform: "translateZ(0)",
                    },
                },
            },
        },
        MuiButtonGroup: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    ':before': {
                        backgroundColor: theme.palette.grey[100],
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    // border: `1px solid ${theme.palette.divider}`,
                    backgroundImage: 'none',
                },
            },
        },
        MuiStepConnector: {
            styleOverrides: {
                line: {
                    borderColor: theme.palette.divider,
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                },
                sizeSmall: {
                    width: 30,
                    height: 30,
                    minHeight: 30,
                },
            },
        },
        // Icon buttons tint the surface on hover and leave the icon alone.
        // Filling with a solid colour and flipping the icon white is a
        // Modernize behaviour the design has no equivalent for.
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    boxShadow: 'none',
                    // Control height and radius from the design's --radius-control.
                    minHeight: 32,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                },
                // Text buttons are transparent. Modernize tinted every colour
                // variant with a filled background, which turns a row of text
                // buttons into a row of coloured blocks.
                text: {
                    padding: '5px 12px',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                },
                // Outlined buttons keep their outline on hover and tint only
                // the surface — no solid fill, no white-on-colour flip.
                outlined: {
                    borderColor: theme.palette.border.strong,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        borderColor: theme.palette.graphite,
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        // Section headings in the design are small uppercase muted labels,
        // not scaled-down page titles.
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '12px 20px',
                    borderBottom: `1px solid ${theme.palette.border.base}`,
                },
                title: {
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: theme.palette.text.muted,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    width: '100%',
                    padding: '15px',
                    backgroundImage: 'none',
                    // Flat surface plus a hairline — the design separates
                    // regions with borders, not elevation.
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.border.base}`,
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '16px 20px',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    // Hairline between data rows. Was a hardcoded black alpha,
                    // which is invisible against a dark surface.
                    borderBottom: `1px solid ${theme.palette.border.faint}`,
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    // Rows stay one line. A wrapping cell breaks the row rhythm
                    // the design depends on, and a table beside a detail panel
                    // is always narrow enough for it to happen.
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '&.MuiTableCell-head': {
                        backgroundColor: theme.palette.background.sunk,
                        color: theme.palette.text.muted,
                        fontWeight: 400,
                        fontSize: '0.65625rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        border: 0,
                        borderBottom: `1px solid ${theme.palette.border.base}`,
                    },
                    '&.MuiTableCell-stickyHeader': {
                        backgroundColor: theme.palette.background.sunk,
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td': {
                        borderBottom: 0,
                    },
                },
            },
        },
        MuiTableSortLabel: {
            styleOverrides: {
                root: {
                    // The header is quiet text, and the sorted column stays quiet with it:
                    // the arrow says which column, not a change of colour.
                    '&.Mui-active': {
                        color: 'inherit',
                        '& .MuiTableSortLabel-icon': { color: 'inherit' },
                    },
                },
                icon: {
                    // Sized to the header's small caps rather than to body text.
                    fontSize: '0.875rem',
                },
            },
        },
        MuiGrid: {
            styleOverrides: {
                root: {
                    paddingTop: '00px',
                    paddingLeft: '0px !important',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.grey[200],
                    borderRadius: '6px',
                },
            },
        },
        MuiTimelineConnector: {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.divider,
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: theme.palette.divider,
                },
            },
        },

        // Badge geometry: 11px / 500 / 4px radius.
        // The size slots are set as well as root because MUI emits its size
        // variants after styleOverrides.root — a root-only radius loses to
        // sizeSmall and small chips stay pill-shaped.
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    fontSize: '0.6875rem',
                    borderRadius: 4,
                },
                sizeSmall: {
                    borderRadius: 4,
                },
                sizeMedium: {
                    borderRadius: 4,
                },
            },
        },
        // Active tab is structure, not action — graphite underline and a
        // weight shift, never the accent hue.
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 44,
                    borderBottom: `1px solid ${theme.palette.border.base}`,
                },
                indicator: {
                    backgroundColor: theme.palette.graphite,
                    height: 2,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 44,
                    padding: '0 0',
                    marginRight: 22,
                    minWidth: 'auto',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                    },
                },
            },
        },
        // MUI hardcodes #faaf00 — replace with the attention amber so the
        // one warm signal on screen is the same one used for expiry warnings.
        MuiRating: {
            styleOverrides: {
                iconFilled: {
                    color: theme.palette.attn.main,
                },
                iconEmpty: {
                    color: theme.palette.border.strong,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                filledSuccess: {
                    color: 'white',
                },
                filledInfo: {
                    color: 'white',
                },
                filledError: {
                    color: 'white',
                },
                filledWarning: {
                    color: 'white',
                },
                standardSuccess: {
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.success.main,
                },
                standardError: {
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.main,
                },
                standardWarning: {
                    backgroundColor: theme.palette.warning.light,
                    color: theme.palette.warning.main,
                },
                standardInfo: {
                    backgroundColor: theme.palette.info.light,
                    color: theme.palette.info.main,
                },
                outlinedSuccess: {
                    borderColor: theme.palette.success.main,
                    color: theme.palette.success.main,
                },
                outlinedWarning: {
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                },
                outlinedError: {
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                },
                outlinedInfo: {
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                },
                icon: {
                    color: theme.palette.info.main,
                },
            },
        },
        // The browser's number spinners are a different visual language to every
        // other control — white, tiny, and useless on a value typed to two decimals.
        // Removed everywhere rather than per field; the keypad `inputMode` is what
        // actually helps on a phone.
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input[type=number]': { MozAppearance: 'textfield' },
                    '& input[type=number]::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                // Fields sit on the recessed surface with a border-strong
                // outline, matching the design's search and comment inputs.
                root: {
                    // Light: fields sit on the raised surface with a firm edge —
                    // a sunk fill on a white card gives three near-identical
                    // tones and the field disappears.
                    // Dark: recessed reads lighter, so the sunk tone is what
                    // separates the field from the panel behind it.
                    backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.background.sunk
                        : theme.palette.background.paper,
                    fontSize: '0.8125rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.border.strong,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.graphite,
                    },
                    // Focus is an action state, so it keeps the accent.
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1,
                    },
                },
                input: {
                    padding: '9px 12px',
                },
                inputSizeSmall: {
                    padding: '6px 10px',
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        padding: '4px 9px'
                    }
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    color: theme.palette.background.paper,
                    background: theme.palette.text.primary,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderColor: `${theme.palette.divider}`,
                },
            },
        },
        // Dialogs are panels: hairline border, control radius, no elevation.
        // The design separates regions with borders rather than shadow.
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    border: `1px solid ${theme.palette.border.base}`,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[9],
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                    padding: '14px 20px',
                    borderBottom: `1px solid ${theme.palette.border.strong}`,
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '16px 20px',
                    fontSize: '0.8125rem',
                    // MUI zeroes the top padding of content that follows a title, which
                    // suits a one-line confirmation and pushes everything else against
                    // the rule. The title is a bordered header here, so content keeps
                    // its own inset. Matching specificity, or the sibling rule wins.
                    '.MuiDialogTitle-root + &': {
                        paddingTop: '16px',
                    },
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '12px 20px',
                    borderTop: `1px solid ${theme.palette.border.base}`,
                },
            },
        },
        // Floating surfaces need a hairline to separate from the page —
        // shadow alone disappears against the dark ground.
        MuiPopover: {
            styleOverrides: {
                paper: {
                    boxShadow: theme.shadows[9],
                    border: `1px solid ${theme.palette.border.base}`,
                    borderRadius: theme.shape.borderRadius,
                    backgroundImage: 'none',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    boxShadow: theme.shadows[9],
                    border: `1px solid ${theme.palette.border.base}`,
                    borderRadius: theme.shape.borderRadius,
                    backgroundImage: 'none',
                    // A menu that scrolls shows a hairline, not the browser's gutter: the
                    // thumb stays faint until the pointer is over the menu.
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.border.base} transparent`,
                    '&:hover': { scrollbarColor: `${theme.palette.text.muted} transparent` },
                },
                list: {
                    paddingTop: 4,
                    paddingBottom: 4,
                },
            },
        },
        MuiMenuList: {
            styleOverrides: {
                root: {
                    // A list that scrolls on its own — the filter menu's options — shows a
                    // hairline, like a scrolling menu does.
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.border.base} transparent`,
                    '&:hover': { scrollbarColor: `${theme.palette.text.muted} transparent` },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: '0.8125rem',
                    minHeight: 34,
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.selected.bg,
                    },
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                valueLabel: {
                    // Graphite so the label inverts correctly in both modes —
                    // a hardcoded dark chip is invisible on a dark surface.
                    backgroundColor: theme.palette.graphite,
                    color: theme.palette.background.paper,
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    // Optional: tweak padding or box-shadow for visibility
                },
            },
        },
    };
};
export default components;
