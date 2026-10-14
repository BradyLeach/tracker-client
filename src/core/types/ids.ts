/**
 * Domain ID Type Aliases
 *
 * Provides stronger typing for foreign key references without
 * importing domain types. Used across preferences, contexts, and services.
 */

export type LanguageId = string & { readonly __brand: 'LanguageId' };
export type CurrencyId = string & { readonly __brand: 'CurrencyId' };
export type CountryId = string & { readonly __brand: 'CountryId' };
export type ProfileId = string & { readonly __brand: 'ProfileId' };

// Helper functions to safely cast strings to branded types
export const createLanguageId = ( id: string ): LanguageId => id as LanguageId;
export const createCurrencyId = ( id: string ): CurrencyId => id as CurrencyId;
export const createCountryId = ( id: string ): CountryId => id as CountryId;
export const createProfileId = ( id: string ): ProfileId => id as ProfileId;
