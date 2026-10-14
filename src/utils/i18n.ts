import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enGB from './languages/en-GB';
import ja from './languages/ja';
import ch from './languages/ch.json';
// Add more languages as you create them:
// import es from '../locales/es.json';

const resources =
{
    'en-GB':
    {
        translation: enGB
    },
    ja:
    {
        translation: ja
    },
    ch:
    {
        translation: ch
    }
};

// Prevent double-initialization in StrictMode or multiple imports
if( !i18n.isInitialized )
{
    i18n
        .use( LanguageDetector ) // Detects user language
        .use( initReactI18next ) // Passes i18n down to react-i18next
        .init(
            {
                resources,

                // Default language
                fallbackLng: 'en-GB',

                // Debug mode for development
                debug: false,

                // Interpolation options
                interpolation: {
                    escapeValue: false, // React already escapes values
                },

                // Language detection - LanguageContext is source of truth
                detection: {
                    order: ['navigator', 'htmlTag'],
                    caches: [],
                },

                // Enable nested translations - disabled to allow interpolation
                returnObjects: true,

                // Separator for nested keys
                keySeparator: '.',

                // Namespace separator
                nsSeparator: ':',
            } );
}

export default i18n;