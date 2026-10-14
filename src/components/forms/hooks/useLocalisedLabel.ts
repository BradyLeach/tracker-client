/**
 * useLocalisedLabel Hook
 *
 * Translates form field label configuration into localised strings for rendering.
 * Handles both simple text labels and "smart labels" with embedded links.
 *
 * **Label Resolution Flow:**
 * 1. If `label.link` and `label.href` exist → Smart label (text + link)
 * 2. If `label.text` exists → Simple text override
 * 3. Otherwise → Default i18n fallback: `forms.{formScope}.fields.{name}`
 *
 * **Important:** This hook returns DATA (strings), not JSX. The FormLabel component
 * handles rendering the actual label with SmartLink for clickable links.
 *
 * @example
 * // Smart label with link (Terms & Conditions)
 * const labelData = useLocalisedLabel({
 *   name: 'acknowledgedTerms',
 *   formScope: 'registration',
 *   label: {
 *     text: 'forms.registration.fields.acknowledgedTerms',
 *     link: 'forms.registration.fields.acknowledgedTermsLink',
 *     href: '/terms'
 *   }
 * });
 * // Returns: {
 * //   text: "I acknowledge the",
 * //   linkText: "Terms and Conditions",
 * //   linkHref: "/terms"
 * // }
 *
 * @example
 * // Simple text override
 * const labelData = useLocalisedLabel({
 *   name: 'email',
 *   label: { text: 'Custom Email Label' }
 * });
 * // Returns: { text: "Custom Email Label" }
 *
 * @example
 * // Default i18n fallback (no label config)
 * const labelData = useLocalisedLabel({
 *   name: 'email',
 *   formScope: 'login'
 * });
 * // Returns: { text: t('forms.login.fields.email') }
 *
 * @param options - Label configuration options
 * @returns Localised label data ready for rendering
 *
 * @see SmartLabel - Component that renders the label using this hook's output
 * @see SmartLink - Handles link routing in rendered labels
 * @see FormLabelConfig - Configuration interface for label structure
 */

import type { FormLabelConfig } from '@/components/forms/types/formConfig.types';
import { useTranslation } from 'react-i18next';

/**
 * Options for useLocalisedLabel hook
 */
export interface UseLocalisedLabelOptions
{
    /** Field name (used for default i18n fallback) */
    name: string;
    /** Form scope for i18n keys (e.g., 'login', 'registration'). Defaults to 'shared'. */
    formScope?: string;
    /** Optional label configuration (text, link, href) */
    label?: FormLabelConfig;
}

/**
 * Result from useLocalisedLabel hook - localised strings ready for rendering
 */
export interface UseLocalisedLabelResult
{
    /** Main label text (always present, translated) */
    text: string;
    /** Optional link text (translated, only present if label has link) */
    linkText?: string;
    /** Optional link URL (only present if label has link) */
    linkHref?: string;
}

/**
 * Hook to translate label configuration into localised strings.
 *
 * Handles i18n translation and returns structured data (not JSX).
 * FormLabel component uses this data to render the actual label.
 *
 * @param options - UseLocalisedLabelOptions
 * @returns UseLocalisedLabelResult with translated strings
 */
export function useLocalisedLabel( {
    name,
    formScope = 'shared',
    label = {}
}: UseLocalisedLabelOptions ): UseLocalisedLabelResult
{
    const { t } = useTranslation();

    // Smart label with link (e.g., Terms & Conditions)
    if( label?.link && label?.href )
    {
        return {
            text: t( label.text || `forms.${formScope}.fields.${name}` ),
            linkText: t( label.link ),
            linkHref: label.href
        };
    }

    // Simple text override
    if( label?.text )
    {
        return { text: t( label.text ) };
    }

    // Default i18n fallback
    return { text: t( `forms.${formScope}.fields.${name}`, name ) };
}