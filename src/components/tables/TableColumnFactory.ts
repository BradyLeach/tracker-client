import { modelRegistry } from '@/core/models/ModelRegistry';
import type { TableColumnConfig, TableColumnType } from './DataTable.types';
import type { ModelDefinition, ModelFieldDefinition } from '@/core/models/types';

/**
 * TableColumnFactory
 *
 * Translates backend model definitions into TableColumnConfig[].
 * Parallel to FormFieldFactory — same source of truth, different output.
 *
 * - Filters to READ-accessible fields only.
 * - Hydrates enum options from `values` or `validation.oneOf`.
 * - Surfaces numeric constraints (`min`, `max`) for number columns.
 * - Derives column labels from camelCase field names.
 *
 * Results are cached per model for performance.
 */
class TableColumnFactory
{
    /**
     * Per-model cache of generated column configs.
     */
    private cache = new Map<string, TableColumnConfig[]>();

    /**
     * Get (and cache) column configs for a given model.
     *
     * @param modelName - Name of the model in the registry (e.g. 'partnership').
     * @returns Array of normalized TableColumnConfig items, one per readable field.
     * @throws Error if the model is missing from the registry.
     */
    getTableColumns( modelName: string ): TableColumnConfig[]
    {
        const cached = this.cache.get( modelName );
        if( cached ) return cached;

        const model = modelRegistry.get( modelName ) as ModelDefinition | undefined;
        if( !model ) throw new Error( `Model not found in registry: ${modelName}` );

        const columns = this.buildColumnsFromModel( model );
        this.cache.set( modelName, columns );
        return columns;
    }

    /**
     * Build column configs from a ModelDefinition.
     *
     * Filters to fields where access includes 'read' (or access is undefined).
     * Maps DSL types to TableColumnType. Sets alignment and populates
     * type-specific props (options for enums, min/max for numbers).
     *
     * @param model - Backend model definition.
     * @returns Array of TableColumnConfig ready for use in DataTable.
     */
    private buildColumnsFromModel( model: ModelDefinition ): TableColumnConfig[]
    {
        return Object.entries( model.schema )
            .filter( ( [, def] ) => !def.access || def.access.includes( 'read' ) )
            .map( ( [name, def] ) =>
            {
                const type = this.mapType( def.type, def.validation?.format as string | undefined );
                return {
                    key: name,
                    label: this.toLabel( name ),
                    type,
                    align: ( type === 'number' || type === 'rating' ) ? 'right' : 'left',
                    ...( type === 'enum' ? this.buildEnumProps( def, name ) : {} ),
                    ...( type === 'number' ? this.buildNumericProps( def ) : {} ),
                } as TableColumnConfig;
            } );
    }

    /**
     * Map a backend DSL type and optional format hint to a TableColumnType.
     *
     * Examples:
     * - `enum` → `'enum'`
     * - `integer` / `number` → `'number'`
     * - `text` + `format: 'email'` → `'email'`
     * - `date` / `datetime` / `dayjs` → `'date'`
     *
     * @param rawType - DSL type string from the model schema.
     * @param format - Optional format hint from validation (e.g. 'email', 'url').
     * @returns The corresponding TableColumnType.
     */
    private mapType( rawType: string, format?: string ): TableColumnType
    {
        switch ( rawType )
        {
            case 'enum': return 'enum';
            case 'boolean': return 'boolean';
            case 'date':
            case 'datetime':
            case 'dayjs': return 'date';
            case 'integer':
            case 'number': return 'number';
            case 'text':
            case 'string':
                if( format === 'email' ) return 'email';
                if( format === 'url' ) return 'url';
                return 'text';
            default: return 'text';
        }
    }

    /**
     * Build the `options` array for enum columns.
     *
     * Prefers `def.values` and falls back to `validation.oneOf`.
     * Labels are i18n keys following the convention `enums.{fieldName}.{value}`.
     * DataTable passes these through `t()` at render time.
     *
     * @param def - Field definition from the model schema.
     * @param fieldName - camelCase field name, used to build the i18n key namespace.
     * @returns `{ options }` when source data is available; otherwise `{}`.
     */
    private buildEnumProps( def: ModelFieldDefinition, fieldName: string ): Pick<TableColumnConfig, 'options'>
    {
        const raw =
            Array.isArray( def.values ) ? def.values :
                Array.isArray( def.validation?.oneOf ) ? def.validation!.oneOf! :
                    undefined;

        if( !raw ) return {};

        type RawEnumValue = string | number | { value: string | number; label?: string };
        const options = ( raw as RawEnumValue[] ).map( v =>
        {
            const rawValue = typeof v === 'string' || typeof v === 'number' ? v : v.value;
            return { value: rawValue, label: `enums.${fieldName}.${String( rawValue )}` };
        } );
        return { options };
    }

    /**
     * Build numeric constraint props (`min`, `max`) for number columns.
     *
     * @param def - Field definition from the model schema.
     * @returns `{ min?, max? }` when constraints are present; otherwise `{}`.
     */
    private buildNumericProps( def: ModelFieldDefinition ): Pick<TableColumnConfig, 'min' | 'max'>
    {
        const result: Pick<TableColumnConfig, 'min' | 'max'> = {};
        if( typeof def.validation?.min === 'number' ) result.min = def.validation.min;
        if( typeof def.validation?.max === 'number' ) result.max = def.validation.max;
        return result;
    }

    /**
     * Derive a human-readable column label from a camelCase field name.
     *
     * @example
     * toLabel('partnershipType') // → 'Partnership Type'
     * toLabel('contactEmail')    // → 'Contact Email'
     *
     * @param fieldName - camelCase field name from the model schema.
     * @returns Title-cased label string.
     */
    private toLabel( fieldName: string ): string
    {
        return fieldName
            .replace( /([A-Z])/g, ' $1' )
            .replace( /^./, s => s.toUpperCase() )
            .trim();
    }

    /**
     * Invalidate the column cache.
     *
     * @param modelName - Drop one model's cache entry; omit to clear all.
     */
    invalidate( modelName?: string ): void
    {
        if( modelName ) this.cache.delete( modelName );
        else this.cache.clear();
    }
}

export const tableColumnFactory = new TableColumnFactory();
