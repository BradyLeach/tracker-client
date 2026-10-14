/**
 * SmartLabel Component
 *
 * Renders label content with optional embedded links (e.g., Terms & Conditions).
 * Returns content only (React Fragment) - parent components handle wrapping.
 * Part of the "Smart" component family (SmartLink, SmartLabel).
 *
 * **Architecture Pattern:**
 * - SmartLabel returns React Fragment with text + optional SmartLink (content only, no wrapper)
 * - Parent components wrap it based on context:
 *   - TextInput/NumberInput: `<CustomFormLabel>{<SmartLabel />}</CustomFormLabel>`
 *   - CheckboxInput: `<FormControlLabel label={<SmartLabel />} />`
 *
 * **Label Flow:**
 * 1. Config defines label structure (text, link, href) - see FormLabelConfig
 * 2. Input component calls useLocalisedLabel hook (translates text via i18n)
 * 3. Input component passes translated data to SmartLabel
 * 4. SmartLabel renders content (text + optional SmartLink)
 * 5. Parent component wraps in appropriate label element
 * 6. SmartLink handles routing (internal/external) automatically
 *
 * **Label Types:**
 * - **Simple label:** Just text (e.g., "Email Address")
 * - **Smart label:** Text + link (e.g., "I acknowledge the [Terms and Conditions]")
 *
 * **Example Usage:**
 * ```tsx
 * // TextInput - Wraps in CustomFormLabel
 * const fieldLabel = useLocalisedLabel({ name, formScope, label });
 *
 * <CustomFormLabel htmlFor={name} required={required}>
 *   <SmartLabel labelData={fieldLabel} />
 * </CustomFormLabel>
 *
 * // CheckboxInput - Passes to FormControlLabel
 * const fieldLabel = useLocalisedLabel({ name, formScope, label });
 *
 * <FormControlLabel
 *   label={<SmartLabel labelData={fieldLabel} />}
 *   required={required}
 *   control={<CustomCheckbox />}
 * />
 * ```
 *
 * **Example Config → Rendered Content:**
 * ```typescript
 * // Config (in buildRegistrationFormConfig.ts)
 * {
 *   name: 'acknowledgedTerms',
 *   label: {
 *     text: 'forms.registration.fields.acknowledgedTerms',     // "I acknowledge the"
 *     link: 'forms.registration.fields.acknowledgedTermsLink', // "Terms and Conditions"
 *     href: '/terms'
 *   }
 * }
 *
 * // SmartLabel renders (content only, no wrapper):
 * <>
 *   "I acknowledge the "
 *   <SmartLink href="/terms">Terms and Conditions</SmartLink>
 * </>
 * ```
 *
 * **Important:**
 * - SmartLabel returns content ONLY - no label wrapper element
 * - Parent components control wrapper, htmlFor attribute, and required indicator
 * - labelData comes from useLocalisedLabel hook (already translated strings)
 * - SmartLink automatically handles internal (/terms) vs external (https://...) links
 * - No JSX or React elements in config - config is pure data
 *
 * @param props - Component props
 * @param props.labelData - Localised label data from useLocalisedLabel hook
 * @returns React Fragment with label content (text + optional SmartLink)
 *
 * @see useLocalisedLabel - Hook that translates label config into strings
 * @see SmartLink - Handles internal/external routing (sibling component)
 * @see FormLabelConfig - Config interface for label structure
 * @see FormTextInput - Example wrapping in CustomFormLabel
 * @see FormCheckboxInput - Example passing to FormControlLabel
 * @see buildRegistrationFormConfig - Example usage with Terms & Conditions
 */

import { Typography, type TypographyProps } from '@/components/ui';
import type { UseLocalisedLabelResult } from "@/components/forms/hooks/useLocalisedLabel";
import { SmartLink } from "@/components/shared/links/SmartLink";

/**
 * Props for SmartLabel component
 */
interface SmartLabelProps extends Omit<TypographyProps, 'children'>
{
    /** Localised label data (text already translated via useLocalisedLabel) */
    labelData: UseLocalisedLabelResult;
}

/**
 * Renders label content with optional embedded link.
 *
 * Returns content only (React Fragment) - parent components handle wrapping.
 * Handles both simple text labels and smart labels with clickable links.
 * All text is pre-translated by useLocalisedLabel hook.
 *
 * @param props - SmartLabelProps
 * @returns React Fragment containing label content (text + optional SmartLink)
 */
export function SmartLabel( { labelData, ...typographyProps }: SmartLabelProps )
{
    return (
        <Typography component="span" {...typographyProps}>
            {/* Main label text (always present) */}
            {labelData.text}

            {/* Optional embedded link (e.g., Terms & Conditions) */}
            {
                labelData.linkText && labelData.linkHref && (
                    <SmartLink
                        href={labelData.linkHref}
                        fontWeight="500"
                        variant="body2"
                        sx={{
                            ml: 1,
                            textDecoration: 'none',
                            color: 'primary.main'
                        }}
                    >
                        {labelData.linkText}
                    </SmartLink>
                )
            }
        </Typography>
    );
}