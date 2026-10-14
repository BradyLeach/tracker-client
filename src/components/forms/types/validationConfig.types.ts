/**
 * Yup validation context passed to schema.validate()
 *
 * Used for conditional validation (e.g., requiredOnCreate) and
 * rule-aware validation (e.g., region-specific age limits).
 *
 * Note: This is a documentation type. FormConfig.context remains `Record<string, any>`
 * for compatibility with react-hook-form's useForm context parameter.
 */
export interface YupValidationContext
{
    /** Service name for rule lookups (e.g., 'identity', 'group') */
    service?: string;
    /** Operation type for rule lookups (e.g., 'create', 'join', 'update') */
    operation?: string;
    /** Region code for rule lookups (e.g., 'au', 'us', 'uk', 'global') */
    regionCode?: string;
    /** Account type level for rule lookups (e.g., 0=basic, 10=standard) */
    accountTypeLevel?: number;
    /** Whether this is a create operation (affects requiredOnCreate fields) */
    isCreate?: boolean;
    /** Whether this is an update operation (affects stripOnUpdate fields) */
    isUpdate?: boolean;
    /** Whether this is a query operation (affects field stripping) */
    isQuery?: boolean;
    /** Allow additional context properties */
    [key: string]: any;  
}