/**
 * Configuration Constants
 *
 * Constants for validation boundaries and type-safe enums.
 * NOT for default values (those live in config modules).
 */

/**
 * Valid environment values
 */
export const ENVIRONMENT = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
} as const;

export type Environment = typeof ENVIRONMENT[keyof typeof ENVIRONMENT];

/**
 * Valid log levels
 */
export const LOG_LEVEL = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
} as const;

export type LogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

/**
 * Valid theme names
 */
export const THEME = {
    STONE: 'STONE_THEME',
} as const;

export type ThemeName = typeof THEME[keyof typeof THEME];

/**
 * Valid theme modes
 */
export const THEME_MODE = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export type ThemeMode = typeof THEME_MODE[keyof typeof THEME_MODE];

/**
 * Valid theme directions
 */
export const THEME_DIRECTION = {
    LTR: 'ltr',
    RTL: 'rtl',
} as const;

export type ThemeDirection = typeof THEME_DIRECTION[keyof typeof THEME_DIRECTION];

/**
 * Valid layout types
 */
export const LAYOUT_TYPE = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
} as const;

export type LayoutType = typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE];

/**
 * Valid layout modes
 */
export const LAYOUT_MODE = {
    FULL: 'full',
    BOXED: 'boxed',
} as const;

export type LayoutMode = typeof LAYOUT_MODE[keyof typeof LAYOUT_MODE];

/**
 * Valid sidebar collapse states
 */
export const SIDEBAR_COLLAPSE = {
    FULL: 'full-sidebar',
    MINI: 'mini-sidebar',
} as const;

export type SidebarCollapse = typeof SIDEBAR_COLLAPSE[keyof typeof SIDEBAR_COLLAPSE];
