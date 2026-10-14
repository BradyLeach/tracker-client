import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { logger } from '@/core/utils/logger';
import type { ObjectSchema } from 'yup';

/**
 * Hook to get Yup validation schema from model registry with i18n support
 */
export function useModelValidation( modelName: string )
{
    const { t } = useTranslation();

    const validationSchema = useMemo( () =>
    {
        if( !modelRegistry.has( modelName ) )
        {
            logger.warn( `Model '${modelName}' not found in registry` );
            return null;
        }
         
        const schema = modelRegistry.getValidation( modelName ) as ObjectSchema<any>;

        if( !schema )
        {
            logger.warn( `No validation schema found for model '${modelName}'` );
            return null;
        }

        logger.debug( `Returning validation schema for ${modelName}`, { modelName } );
        return schema;
    }, [modelName] );

    const getFieldLabel = ( fieldName: string ): string =>
    {
        return t( `fields.${modelName}.${fieldName}`, {
            defaultValue: t( `fields.${fieldName}`, fieldName )
        } );
    };

    const getFieldPlaceholder = ( fieldName: string ): string =>
    {
        return t( `placeholders.${modelName}.${fieldName}`, {
            defaultValue: t( `placeholders.${fieldName}`, `Enter ${getFieldLabel( fieldName ).toLowerCase()}` )
        } );
    };

    const getFieldHelperText = ( fieldName: string ): string =>
    {
        return t( `helpers.${modelName}.${fieldName}`, {
            defaultValue: t( `helpers.${fieldName}`, '' )
        } );
    };

    const getFieldOptions = ( fieldName: string ): unknown[] =>
    {
        const model = modelRegistry.get( modelName );
        if( !model || !model.schema || !model.schema[fieldName] )
        {
            return [];
        }

        const field = model.schema[fieldName];
        return field.validation?.oneOf || [];
    };

    return {
        validationSchema,
        getFieldLabel,
        getFieldPlaceholder,
        getFieldHelperText,
        getFieldOptions,
        modelExists: modelRegistry.has( modelName ),
    };
}