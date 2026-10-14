import * as yup from 'yup';
import { fieldJsonToYup } from './fieldJsonToYup';

/**
 * Builds a Yup validation schema from a field definition map.
 *
 * @param fields - Map of field names to their schema definitions.
 * @returns A Yup object schema that validates the defined fields.
 */
export function buildValidationSchema(
    fields: Record<string, any>
): yup.ObjectSchema<any>
{
    const shape: Record<string, yup.AnySchema> = {};

    for( const [key, def] of Object.entries( fields ) )
    {
        shape[key] = fieldJsonToYup( def );
    }

    return yup.object().shape( shape );
}
