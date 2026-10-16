/**
 * useLocalisedHelp Hook
 *
 * Translates a form field's help text — one line under the field saying what goes in it.
 * Resolved the same way as placeholders:
 * 1. If `help` is provided → that i18n key
 * 2. Otherwise → `forms.{formScope}.fields.{name}Help`
 * 3. If no translation exists → empty string, and no help is shown
 *
 * A field's validation error replaces its help while there is one.
 *
 * @see useLocalisedPlaceholder - Sister hook for placeholder text
 */

import { useTranslation } from 'react-i18next';

export interface UseLocalisedHelpOptions
{
    /** Field name (used for the default i18n key) */
    name: string;
    /** Form scope for i18n keys. Defaults to 'shared'. */
    formScope?: string;
    /** Optional i18n key overriding the default */
    help?: string;
}

/**
 * @param options - UseLocalisedHelpOptions
 * @returns Localised help string, or empty string when the field has none
 */
export function useLocalisedHelp( { name, formScope = 'shared', help }: UseLocalisedHelpOptions ): string
{
    const { t } = useTranslation();

    return help ? t( help, '' ) : t( `forms.${formScope}.fields.${name}Help`, '' );
}
