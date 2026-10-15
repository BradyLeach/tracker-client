import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormFieldConfig } from '../types/formConfig.types';
import type { ModelDefinition, ModelFieldDefinition } from '@/core/models/types';

/**
 * FormFieldFactory
 *
 * Factory that translates backend model definitions into frontend `FormFieldConfig[]`.
 * - Returns **all** model fields (no create/update filtering).
 * - Hydrates enum `options` from `values` or `validation.oneOf`.
 * - Surfaces numeric constraints (`min`, `max`) via `props`.
 * Results are cached per model for performance.
 */
class FormFieldFactory
{
    /**
     * Per-model cache of generated field configs.
     */
    private cache = new Map<string, FormFieldConfig[]>();

    /**
     * Get (and cache) field configs for a given model.
     *
     * @param modelName - Name of the model in the registry.
     * @returns Array of normalized `FormFieldConfig` items.
     * @throws Error if the model is missing from the registry.
     */
    getFormFields( modelName: string ): FormFieldConfig[]
    {
        const cached = this.cache.get( modelName );
        if( cached )
        {
            return cached;
        }

        const model = modelRegistry.get( modelName ) as ModelDefinition | undefined;
        if( !model )
        {
            throw new Error( `Model not found: ${modelName}` );
        }

        const fields = this.buildFieldsFromModel( model );

        this.cache.set( modelName, fields );

        return fields;
    }

    /**
     * Build field configs from a `ModelDefinition`.
     * - Maps DSL types to UI field `type`.
     * - Sets `required` from `validation.requiredOnCreate`.
     * - Adds `options` for enums, and `min/max` for numbers.
     *
     * @param model - Backend model definition (schema-first DSL).
     * @returns Array of `FormFieldConfig` ready for rendering.
     */
    private buildFieldsFromModel( model: ModelDefinition ): FormFieldConfig[]
    {
        return Object.entries( model.schema ).map( ( [name, def] ) =>
        {
            const type = this.mapType( def.type, def.validation?.format as string | undefined );
            return {
                name,
                type,
                required: !!def.validation?.requiredOnCreate,
                ...( type === 'select' ? this.buildSelect( def ) : {} ),
                ...( type === 'number' ? this.buildNumberProps( def ) : {} ),
            } as FormFieldConfig;
        } );
    }

    /**
     * Build `options` for enum/select fields.
     * Prefers `def.values` (string[] or {value,label}[]) and falls back to `validation.oneOf`.
     *
     * @param def - Field definition from the model schema.
     * @returns `{ options }` when available; otherwise `{}`.
     */
    private buildSelect( def: ModelFieldDefinition ): Pick<FormFieldConfig, 'options'>
    {
        // Prefer `values`, fallback to `validation.oneOf`
        const raw =
            Array.isArray( def.values ) ? def.values :
                Array.isArray( def.validation?.oneOf ) ? def.validation!.oneOf! :
                    undefined;

        if( !raw )
        {
            return {};
        }
         
        const options = ( raw as any[] ).map( v =>
            typeof v === 'string' || typeof v === 'number'
                ? { value: v, label: String( v ) }
                : { value: v.value, label: v.label ?? String( v.value ) }
        );
        return { options };
    }

    /**
     * Build numeric props (e.g., `min`, `max`) for number inputs.
     *
     * @param def - Field definition from the model schema.
     * @returns `{ props: { min?, max? } }` when present; otherwise `{}`.
     */
    private buildNumberProps( def: ModelFieldDefinition ): Pick<FormFieldConfig, 'props'>
    {
        const { min, max } = def.validation ?? {};
        const props: Record<string, unknown> = {};
        if( typeof min === 'number' )
        {
            props.min = min;
        }
        if( typeof max === 'number' )
        {
            props.max = max;
        }
        return Object.keys( props ).length ? { props } : {};
    }

    /**
     * Map backend DSL type + optional `validation.format` to a UI field type.
     * Examples:
     *  - `string` + `format: 'email'` → `'email'`
     *  - `enum` → `'select'`
     *  - `number`/`integer` → `'number'`
     *  - `date`/`datetime` → `'date'`
     *
     * @param rawType - DSL type from the model schema.
     * @param format - Optional format hint (e.g., 'email', 'password', 'url').
     * @returns A `FormFieldConfig['type']` suitable for the renderer.
     */
    private mapType( rawType: string, format?: string ): FormFieldConfig['type']
    {
        switch ( rawType )
        {
            case 'enum': return 'select';
            case 'text':
            case 'string':
                if( format === 'email' ) return 'email';
                if( format === 'password' ) return 'password';
                if( format === 'url' ) return 'url';
                return 'text';
            case 'boolean': return 'checkbox';
            case 'date':
            case 'datetime':
            case 'dayjs': return 'date';
            case 'number':
            case 'integer':
            case 'bigint': return 'number';
            case 'array': return 'tags';
            default: return 'text';
        }
    }

    /**
     * Invalidate the cache.
     * - Pass a `modelName` to drop only that entry.
     * - Call without arguments to clear the entire cache.
     *
     * @param modelName - Optional model name to invalidate.
     */
    invalidate( modelName?: string )
    {
        if( modelName ) this.cache.delete( modelName );
        else this.cache.clear();
    }
}

export const formFieldFactory = new FormFieldFactory();
