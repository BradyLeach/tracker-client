
/**
 * Configuration for field labels in forms.
 *
 * Supports simple text labels or text with embedded links.
 * All fields optional - omit entirely to use default i18n: t('forms.{formScope}.fields.{name}')
 *
 * @example
 * // Simple text override (literal or i18n key - i18n returns as-is if no translation found)
 * { text: 'Email Address' }
 * { text: 'forms.registration.fields.email' }
 *
 * @example
 * // Label with embedded link (e.g., "I acknowledge the [Terms and Conditions]")
 * {
 *   text: 'forms.registration.fields.acknowledgedTerms',  // "I acknowledge the"
 *   link: 'forms.registration.fields.acknowledgedTermsLink',  // "Terms and Conditions"
 *   href: '/terms'
 * }
 *
 * @example
 * // No labelConfig - uses default i18n fallback
 * undefined
 */
export interface FormLabelConfig
{
    /** Label text (literal string or i18n key) - rendered before link if link exists */
    text?: string;
    /** Link text (literal string or i18n key) - rendered as clickable link (requires href) */
    link?: string;
    /** Link URL - when present with link text, renders: text + <Link>link</Link> */
    href?: string;
}

/**
 * Configuration for form footer links (e.g., "Already have an account? Sign In")
 */
export interface FormLinkConfig
{
    /** Text before the link */
    prefaceText: string;
    /** Link text */
    linkText: string;
    /** Link URL */
    href: string;
}

/**
 * Supported field types for dynamic forms.
 * Extend as your app grows.
 */
export type FormFieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'url'
    | 'number'
    | 'date'
    | 'select'
    | 'autocomplete'
    | 'tags'
    | 'checkbox'
    | 'slider'
    | 'rating'
    | 'code'
    | 'icon';

/**
 * Configuration for a single form field.
 * Used to drive rendering, validation, and behavior.
 */
export interface FormFieldConfig
{
    /** Field key (must match data shape) */
    name: string;
    /** Field type; determines component and behavior */
    type: FormFieldType;
    /** Optional: label configuration (simple text, i18n keys, or rich labels with links). Falls back to i18n if omitted. */
    label?: FormLabelConfig;
    /** Optional: field placeholder override (defaults to i18n if omitted) */
    placeholder?: string;
    /** Optional: i18n key for help text under the field (defaults to `forms.{formScope}.fields.{name}Help`) */
    help?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Optional: default value for the field */
     
    defaultValue?: any;
    /** Options for select/autocomplete fields (or enums) */
    options?: Array<{ value: string | number; label: string }>;
    /** If true, options are loaded asynchronously (e.g., remote lookup) */
    asyncOptions?: boolean;
    /** For autocomplete fields: allow arbitrary user-typed values (default false = constrained) */
    freeSolo?: boolean;
    /** If true, field is not part of the main model (UI-only, e.g., passwordConfirm) */
    virtual?: boolean;
    /** Hide the label (only show input). Useful for compact layouts. Defaults to false. */
    hideLabel?: boolean;
    /** Any extra props for custom or advanced field rendering (e.g., labelComponent, icon, etc.) */
     
    props?: Record<string, any>;
}

/**
 * Configuration for a single status item (data-driven, no ReactNode).
 */
export interface StatusItemConfig
{
    /** The raw status value (e.g., 'verified', 'active') */
    value: string;
    /** i18n key for the row label (e.g., 'shared.labels.verificationStatus') */
    labelKey: string;
    /** i18n key for the chip value (e.g., 'shared.verificationStatus.verified') */
    translationKey: string;
}

/**
 * A status group — renders read-only status rows with chips.
 */
export interface StatusGroupConfig
{
    type: 'status';
    /** Optional: section/group title */
    title?: string;
    /** Status items to display */
    items: StatusItemConfig[];
}

/**
 * A field group — renders editable form fields.
 */
export interface FieldGroupConfig
{
    type: 'fields';
    /** Optional: section/group title */
    title?: string;
    /** Optional: section/group subtitle or description */
    subtitle?: string;
    /** Array of fields in this group (rendered in order) */
    fields: FormFieldConfig[];
}

/**
 * Union of all group entry types. Extend with future group types here.
 */
export type FormGroupEntry = FieldGroupConfig | StatusGroupConfig;

/**
 * @deprecated Use {@link FieldGroupConfig} instead. Kept for backwards compatibility during transition.
 */
export type FormFieldGroupConfig = FieldGroupConfig;

/**
 * Top-level form configuration for dynamic rendering.
 * Drives fields, layout, validation, and metadata.
 */
export interface FormConfig
{
    /** Form title (displayed at top, optional) */
    title?: string;
    /** Form subtitle/description (optional) */
    subtitle?: string;
    /** Field groups/sections (array of groups, at least one) */
    groups: FormGroupEntry[];
    /** Validation schema (Yup object, built with config factory) */
     
    validationSchema?: any;
    /** The validation context to ensure the appropriate fields are stripped or required. */
     
    context?: Record<string, any>; // e.g. { isCreate: true, isUpdate: true }
    /** Optional footer link configuration (e.g., "Already have an account? Sign In") */
    footerLink?: FormLinkConfig;
}
