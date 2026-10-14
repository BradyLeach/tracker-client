
import * as yup from 'yup';
import type {
    ModelFieldDefinition,
    ModelArrayItem,
    ModelFieldValidation,
} from './types';

type FieldSpec = ModelFieldDefinition | ModelArrayItem;
type YupSchema = yup.AnySchema;

/**
 * Converts a single field's JSON validation block into a Yup validator.
 *
 * This is the main entry point for schema-driven validation across the app.
 * Supports all core Yup types, conditional required, and custom extension rules.
 *
 * @param {ModelFieldDefinition} field - Normalized field definition from model schema.
 * @returns {yup.Schema} Yup validator for field, ready to compose into an object schema.
 */
export function fieldJsonToYup( field: FieldSpec ): YupSchema
{
    // 🔧 strong type the spread result
    const validation: ModelFieldValidation = {
        ...( field.validation ?? {} ),
    } as ModelFieldValidation;

    // map pattern -> matches once
    if( validation.pattern && !validation.matches )
    {
        validation.matches = new RegExp( validation.pattern );
    }

    // derive enum oneOf from values if needed
    if( field.type === 'enum' && !validation.oneOf )
    {
        const values: any[] | undefined = ( field as any ).values;
        if( Array.isArray( values ) )
        {
            validation.oneOf = values.map( v => ( typeof v === 'string' ? v : v.value ) );
        }
    }

    let schema = _createBaseSchema( field.type, validation );
    schema = _applyCustomValidators( schema, validation.custom );
    return schema;
}

/**
 * Returns the base Yup schema for the provided type, including all constraints.
 *
 * @param {string} type - The field type.
 * @param {ModelFieldDefinition['validation']} validation - Field validation config.
 * @returns {yup.Schema} Typed Yup validator.
 */
function _createBaseSchema( type: string, validation: ModelFieldValidation = {} ): YupSchema
{
    let schema: YupSchema;

    switch ( type )
    {
        case 'string':
        case 'text':
            schema = _buildStringSchema( validation );
            break;
        case 'enum':
            schema = _buildEnumSchema( validation );
            break;
        case 'decimal':
        case 'number':
        case 'integer':
        case 'bigint':
            schema = _buildNumberSchema( type, validation );
            break;
        case 'boolean':
            schema = _buildBooleanSchema( validation );
            break;
        case 'date':
        case 'datetime':
            schema = _buildDateSchema( validation );
            break;
        case 'uuid':
        case 'uuidv4':
            schema = yup.string().uuid();
            break;
        case 'array':
            schema = _buildArraySchema( validation );
            break;
        default:
            schema = _buildMixedSchema( validation );
    }

    return _applyConditionalLogic( schema, validation );
}

/**
 * Enum validation schema. `oneOf` is checked independently of nullability, so a
 * nullable enum has to name `null` as a permitted member as well — marking the
 * schema nullable alone still fails the membership test.
 */
function _buildEnumSchema( validation: ModelFieldValidation = {} ): YupSchema
{
    let schema: YupSchema = yup.mixed();

    if( validation.oneOf )
    {
        const permitted = validation.nullable
            ? [...validation.oneOf, null]
            : validation.oneOf;

        schema = schema.oneOf( permitted );
    }

    return schema;
}

/**
 * Fallback schema for types with no dedicated branch (e.g. `jsonb`). `yup.mixed()`
 * performs no type check at all, so it accepts `null` on its own — a non-nullable
 * field gets an explicit test rejecting `null` so that stays opt-in like every
 * other type.
 */
function _buildMixedSchema( validation: ModelFieldValidation = {} ): YupSchema
{
    if( validation.nullable )
    {
        return yup.mixed();
    }

    return yup.mixed().test(
        'non-nullable',
        '${path} cannot be null',
        value => value !== null
    );
}

/**
 * Applies conditional/shared rules for any schema type: nullable, required,
 * requiredOnCreate (via `.when()`), isReadOnly stripping, and default (applied
 * only on create, mirroring the backend's `_applyConditionalRules`).
 *
 * @param {yup.AnySchema} schema - Base Yup schema.
 * @param {ModelFieldValidation} validation - Field validation config.
 * @returns {yup.AnySchema} Schema with conditional logic applied.
 */
function _applyConditionalLogic(
    schema: YupSchema,
    validation: ModelFieldValidation = {},
): YupSchema
{
    if( validation.nullable )
    {
        schema = schema.nullable();
    }

    if( validation.required )
    {
        schema = schema.required();
    }

    if( validation.requiredOnCreate )
    {
        schema = schema.when( '$isCreate', {
            is: true,
            then: s => s.required()
        } );
    }

    if( validation.isReadOnly )
    {
        schema = schema.when( '$isQuery', {
            is: true,
            otherwise: scheme => scheme.strip()
        } );
    }

    if( validation.default !== undefined )
    {
        schema = schema.when( '$isCreate', {
            is: true,
            then: s => s.default( validation.default )
        } );
    }

    return schema;
}

function toRegExp( p: string | RegExp ): RegExp
{
    if( p instanceof RegExp ) return p;
    // support "/pattern/flags" or plain "pattern"
    const m = /^\/(.+)\/([gimsuy]*)$/.exec( p );
    return m ? new RegExp( m[1], m[2] ) : new RegExp( p );
}

/**
 * String/text validation schema with all constraints, in correct order.
 */
function _buildStringSchema( validation: ModelFieldDefinition['validation'] = {} ): yup.StringSchema
{
    let schema: yup.StringSchema = yup.string()
        .transform( v =>
            typeof v === 'string' && v.trim() === '' ? undefined : v
        );

    if( validation.min !== undefined ) schema = schema.min( validation.min );
    if( validation.max !== undefined ) schema = schema.max( validation.max );
    if( validation.format === 'email' ) schema = schema.email();
    if( validation.format === 'url' ) schema = schema.url();

    if( validation.matches )
    {
        const rx = toRegExp( ( validation.matches as any ) ?? ( validation.pattern as any ) );
        schema = schema.matches( rx );
    }

    return schema;
}

/**
 * Number/decimal/integer validation schema.
 */
function _buildNumberSchema(
    type: string, validation: ModelFieldValidation = {}
): yup.NumberSchema
{
    let schema: yup.NumberSchema = yup.number()
        .transform( ( value, originalValue ) =>
        {
            // empty input -> undefined (so "required" triggers, not type error)
            if( originalValue === '' || originalValue === null || Number.isNaN( value ) )
            {
                return undefined;
            }
            return value;
        } );

    if( type === 'integer' )
    {
        schema = schema.integer();
    }
    if( typeof validation.min === 'number' )
    {
        schema = schema.min( validation.min );
    }
    if( typeof validation.max === 'number' )
    {
        schema = schema.max( validation.max );
    }

    return schema;
}

/**
 * Boolean validation schema.
 */
function _buildBooleanSchema(
    validation: ModelFieldValidation = {}
): yup.BooleanSchema
{
    let schema: yup.BooleanSchema = yup.boolean();

    // Support oneOf validation for checkboxes that must be true (e.g., T&Cs)
    // Use .test() instead of .oneOf() for better error messages
    if( validation.oneOf && validation.oneOf.includes( true ) )
    {
        schema = schema.test(
            'must-accept',
            () => ( { key: validation.customErrorKey } ),
            ( value ) => value === true
        );
    }

    return schema;
}

/**
 * Date validation schema.
 */
function _buildDateSchema(
    validation: ModelFieldValidation = {}
): yup.DateSchema
{
    let schema: yup.DateSchema = yup.date();

    if( validation.min !== undefined )
    {
        schema = schema.min( validation.min );
    }
    if( validation.max !== undefined )
    {
        schema = schema.max( validation.max );
    }

    return schema;
}

/**
 * Array validation schema with item constraints.
 */
function _buildArraySchema( validation: ModelFieldValidation = {} ): yup.ArraySchema<any>
{
    const itemSchema = validation.items ? fieldJsonToYup( validation.items ) : yup.mixed();
    return yup.array().of( itemSchema );
}

/**
 * Applies custom validation rules via extension array.
 *
 * @param {yup.Schema} schema - Base schema to modify.
 * @param {string[]} customRules - Array of custom rule names.
 * @returns {yup.Schema} Schema with custom validators applied.
 */
function _applyCustomValidators( schema: YupSchema, customRules?: string[] ): YupSchema
{
    if( !Array.isArray( customRules ) ) return schema;

    for( const rule of customRules )
    {
        if( rule === 'validDob' )
        {
            schema = ( schema as any ).validDob();
        }
        if( rule === 'utc' )
        {
            schema = ( schema as any ).utc();
        }
        if( rule === 'isJson' )
        {
            schema = ( schema as any ).isJson();
        }
        if( rule === 'mustAccept' )
        {
            schema = ( schema as any ).mustAccept();
        }
        if( rule === 'mustConfirm' )
        {
            schema = ( schema as any ).mustConfirm();
        }
    }
    return schema;
}
