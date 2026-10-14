/**
 * UI Configuration Module
 *
 * Default theme and layout configuration.
 * Loaded during bootstrap from localStorage with these defaults as fallback.
 */

import
{
    LAYOUT_MODE,
    LAYOUT_TYPE,
    SIDEBAR_COLLAPSE,
    THEME,
    THEME_DIRECTION,
    THEME_MODE,
} from '../../src/core/utils/constants';

/**
 * UI configuration interface
 */
export interface UIConfig
{
    activeDir: typeof THEME_DIRECTION[keyof typeof THEME_DIRECTION];
    activeMode: typeof THEME_MODE[keyof typeof THEME_MODE];
    activeTheme: typeof THEME[keyof typeof THEME];
    activeLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE];
    isLayout: typeof LAYOUT_MODE[keyof typeof LAYOUT_MODE];
    isSidebarHover: boolean;
    isCollapse: typeof SIDEBAR_COLLAPSE[keyof typeof SIDEBAR_COLLAPSE];
    // isLanguage: string;
    isCardShadow: boolean;
    isMobileSidebar: boolean;
    isHorizontal: boolean;
    borderRadius: number;
    sidebarWidth: number;
    miniSidebarWidth: number;
    topbarHeight: number;
}

/**
 * Default UI configuration (all environments)
 */
export const uiConfig: UIConfig = {
    activeDir: THEME_DIRECTION.LTR,
    activeMode: THEME_MODE.DARK,
    activeTheme: THEME.STONE,
    activeLayout: LAYOUT_TYPE.VERTICAL,
    isLayout: LAYOUT_MODE.BOXED,
    isSidebarHover: false,
    isCollapse: SIDEBAR_COLLAPSE.FULL,
    isCardShadow: true,
    isMobileSidebar: false,
    isHorizontal: false,
    borderRadius: 7,
    sidebarWidth: 270,
    miniSidebarWidth: 87,
    topbarHeight: 70,
};