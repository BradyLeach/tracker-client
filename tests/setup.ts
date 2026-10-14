import '@testing-library/jest-dom';

// jsdom ships no IndexedDB, so the Dexie-backed DataStore has nothing to run against.
// fake-indexeddb is a spec implementation rather than a stand-in: registering it here
// means the adapter is exercised as written, with no test branch in production code.
import 'fake-indexeddb/auto';

import { vi } from 'vitest';

// Mock environment variables for tests
// Note: ImportMeta.env is already defined by Vite, we just set the values
Object.defineProperty( import.meta, 'env', {
    value: {
        DEV: true,
        MODE: 'test',
        VITE_ENVIRONMENT: 'test'
    },
    writable: true
} );

// Mock i18next for all tests
const i18nMock = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis(),
    t: ( key: string ) => key,
    exists: ( key: string ) => true,
    changeLanguage: vi.fn().mockResolvedValue( undefined ),
    language: 'en-GB',
    isInitialized: true,
    on: vi.fn(),
    off: vi.fn(),
};

vi.mock( 'i18next', () => ( { default: i18nMock } ) );
vi.mock( 'react-i18next', () => ( {
    useTranslation: () => ( { t: ( key: string ) => key, i18n: i18nMock } ),
    initReactI18next: { type: '3rdParty', init: vi.fn() },
    I18nextProvider: ( { children }: any ) => children,
} ) );
vi.mock( 'i18next-browser-languagedetector', () => ( { default: {} } ) );