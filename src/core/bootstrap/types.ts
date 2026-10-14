export interface BootstrapLoader<T = unknown>
{
    name: string;
    critical: boolean; // If true, failure stops boot
    load(): Promise<T>; // Returns typed data to be stored in context
}

export type LoaderResult<T = unknown> =
    | { status: 'success'; data: T; duration: number }
    | { status: 'failed'; error: Error; duration: number };

export type BootstrapContext = Partial<TypedBootstrapContext>;

// Optional: Derive fully typed context from loader list
// Usage: const typedContext = context as TypedBootstrapContext;
import type { AppConfig } from '@/../config/types';
import type { I18nConfig } from './loaders/I18nLoader';
import type { AuthConfig } from './loaders/AuthLoader';

export interface TypedBootstrapContext
{
    config: AppConfig;
    publicModels: void;
    i18n: I18nConfig;
    // Theme handled by ThemeContext (no bootstrap loader)
    auth?: AuthConfig; // Optional since non-critical
}