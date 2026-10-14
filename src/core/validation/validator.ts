/**
 * Configuration Validators
 *
 * Generic, reusable validation utilities.
 */

import * as Yup from 'yup';

/**
 * Validates a number is within a range
 */
export async function validateNumberInRange( value: number, min: number, max: number ): Promise<number>
{
    return await Yup.number().min( min ).max( max ).required().validate( value );
}

/**
 * Validates a string is one of allowed values
 */
export async function validateStringEnum( value: string, allowedValues: readonly string[] ): Promise<string>
{
    return await Yup.string().oneOf( allowedValues as string[] ).required().validate( value );
}

/**
 * Validates cross-field comparison (e.g., max > min)
 */
export async function validateRange(
    min: number,
    max: number,
    minLimit: number,
    maxLimit: number ):
    Promise<{ min: number; max: number }>
{
    const schema = Yup.object( {
        min: Yup.number().min( minLimit ).max( maxLimit ).required(),
        max: Yup.number().min( minLimit ).max( maxLimit ).required()
            .test( 'max-greater-than-min', 'Max must be greater than min', function( value )
            {
                return value! > this.parent.min;
            } ),
    } );

    return await schema.validate( { min, max } );
}
