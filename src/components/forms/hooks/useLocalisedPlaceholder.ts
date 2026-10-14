/**
 * useLocalisedPlaceholder Hook
 *
 * Translates form field placeholder text using i18n.
 * Returns a localised string (not JSX) ready for input placeholder attributes.
 *
 * **Placeholder Resolution Flow:**
 * 1. If `placeholder` is provided → Use custom placeholder text
 * 2. Otherwise → Default i18n fallback: `forms.{formScope}.fields.{name}Placeholder`
 * 3. If no translation exists → Returns empty string (no placeholder)
 *
 * **Important:** This hook returns a STRING, not JSX. Input components pass this
 * directly to their placeholder attribute.
 *
 * @example
 * // Custom placeholder override
 * const placeholder = useLocalisedPlaceholder({
 *   name: 'email',
 *   placeholder: 'you@example.com'
 * });
 * // Returns: "you@example.com"
 *
 * @example
 * // Default i18n fallback
 * const placeholder = useLocalisedPlaceholder({
 *   name: 'email',
 *   formScope: 'login'
 * });
 * // Returns: t('forms.login.fields.emailPlaceholder')
 * // Example output: "Enter your email address"
 *
 * @example
 * // No translation exists
 * const placeholder = useLocalisedPlaceholder({
 *   name: 'customField',
 *   formScope: 'shared'
 * });
 * // Returns: "" (empty string, no placeholder shown)
 *
 * @param options - Placeholder configuration options
 * @returns Localised placeholder string
 *
 * @see FormTextInput - Uses this hook for placeholder text
 * @see useLocalisedLabel - Sister hook for label translation
 */

import { useTranslation } from 'react-i18next';

/**
 * Options for useLocalisedPlaceholder hook
 */
export interface UseLocalisedPlaceholderOptions
{
    /** Field name (used for default i18n fallback) */
    name: string;
    /** Form scope for i18n keys (e.g., 'login', 'registration'). Defaults to 'shared'. */
    formScope?: string;
    /** Optional custom placeholder text (literal or i18n key) */
    placeholder?: string;
}

/**
 * Hook to translate placeholder text via i18n.
 *
 * Returns a string ready for input placeholder attributes.
 *
 * @param options - UseLocalisedPlaceholderOptions
 * @returns Localised placeholder string (or empty string if no translation)
 */
export function useLocalisedPlaceholder( { name, formScope = 'shared', placeholder }:
    UseLocalisedPlaceholderOptions ): string
{
    const { t } = useTranslation();

    // Custom placeholder override (literal or i18n key)
    // Or default i18n fallback (returns empty string if translation not found)
    return placeholder
        ? t( placeholder, placeholder )
        : t( `forms.${formScope}.fields.${name}Placeholder`, '' );
}