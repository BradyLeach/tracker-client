// core/context/hydration/registry.ts
import { themeHydrator } from '../theme/theme.hydrator';
import { languageHydrator } from '../language/language.hydrator';
import { currencyHydrator } from '../currency/currency.hydrator';
import { countryHydrator } from '../country/country.hydrator';
import { profileHydrator } from '../profile/profile.hydrator';

export const hydrationRegistry = {
    theme: themeHydrator,
    language: languageHydrator,
    currency: currencyHydrator,
    country: countryHydrator,
    profile: profileHydrator
    // Note: menu excluded - system-wide, not profile-specific
};
