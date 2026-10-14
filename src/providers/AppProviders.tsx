import { Suspense, type ReactNode } from 'react';

// Providers
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { PreferencesProvider } from '@/providers/PreferenceProviders';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/utils/i18n';

// Pages
import { ErrorBoundary } from '@/core/systems/error/ErrorBoundary';

// Infra
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { router } from '@/routes/Router';
import { BuildTheme } from '@/theme/Theme';
import { FullPageLoading } from '@/components/pages/FullPageLoading';
import 'dayjs/locale/en-gb';

// Context providers
import
{
    ProfileProvider,
    MenuProvider,
    useTheme,
} from '@/core/context';
import { ContextDefaults } from '@/core/context/ContextDefaults';
import { I18nSync } from '@/core/context/language/I18nSync';

interface AppProvidersProps
{
    children?: ReactNode;
}

/**
 * Consumes ThemeContext and provides MUI theme
 * Separate component so MUI theme updates reactively with context changes
 */
function MuiThemeConsumer( { children }: { children: ReactNode } )
{
    const { mode, themeName, direction } = useTheme();
    const theme = BuildTheme( { mode, theme: themeName, direction } );

    // Use default dayjs locale - I18nSync handles the actual language sync
    const dayjsLocale = 'en-gb';

    return (
        <MuiThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjsLocale}>
                <CssBaseline />
                {children}
            </LocalizationProvider>
        </MuiThemeProvider>
    );
}

/**
 * Root provider composition for the application.
 * Wraps all context providers in the correct order to ensure proper initialization.
 *
 * @param props - Component props
 * @returns Provider tree with all application contexts
 */
export function AppProviders( { children }: AppProvidersProps )
{
    return (
        <HelmetProvider>
            <I18nextProvider i18n={i18n}>
                <PreferencesProvider>
                    <ProfileProvider>
                        <MenuProvider>
                            <ContextDefaults>
                                <ErrorBoundary>
                                    <MuiThemeConsumer>
                                        <I18nSync>
                                            <Suspense fallback={<FullPageLoading />}>
                                                {children || <RouterProvider router={router} />}
                                            </Suspense>
                                        </I18nSync>
                                    </MuiThemeConsumer>
                                </ErrorBoundary>
                            </ContextDefaults>
                        </MenuProvider>
                    </ProfileProvider>
                </PreferencesProvider>
            </I18nextProvider>
        </HelmetProvider>
    );
}
