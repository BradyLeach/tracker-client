import type { Control, FieldError } from 'react-hook-form';
import type { FormLabelConfig } from "@/components/forms/types/formConfig.types";

export interface BaseFieldProps
{
    /** Field name/key (must match form schema). */
    name: string;
    /** React Hook Form control instance. */
     
    control: Control<any>;
    /** Optional label to display; if omitted, falls back to i18n `forms.{formScope}.fields.{name}`. */
    label?: FormLabelConfig;
    /** Field error from react-hook-form. */
    error?: FieldError;
    /** Whether to display as required (adds `*` to label). */
    required?: boolean;
    /** Form scope for i18n keys (e.g., 'login', 'registration'). Falls back to 'shared' if not provided. */
    formScope?: string;
    /** Sets input as disabled (read-only) */
    disabled?: boolean;
    /** Sets field to full width (default: true). */
    fullWidth?: boolean;
    /** Hide the label (only show input). Useful for compact layouts. Defaults to false. */
    hideLabel?: boolean;
}