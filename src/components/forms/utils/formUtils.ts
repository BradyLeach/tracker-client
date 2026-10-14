import i18n from 'i18next';
import type { FormConfig, FieldGroupConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';

export function extractDefaultValues( config: FormConfig ): Record<string, unknown>
{
    const result: Record<string, unknown> = {};
    config.groups
        .filter( ( g ): g is FieldGroupConfig => g.type === 'fields' )
        .forEach( group =>
        {
            group.fields.forEach( field =>
            {
                if( field.defaultValue !== undefined )
                {
                    result[field.name] = field.defaultValue;
                }
            } );
        } );
    return result;
}

/** Names of the fields a config renders. */
export function getFieldNames( config: FormConfig ): string[]
{
    return config.groups
        .filter( ( g ): g is FieldGroupConfig => g.type === 'fields' )
        .flatMap( group => group.fields.map( field => field.name ) );
}

/** The submitted values that belong to one config's fields — splits a composed submission back per model. */
export function pickFieldValues( config: FormConfig, data: Record<string, unknown> ): Record<string, unknown>
{
    return Object.fromEntries(
        getFieldNames( config )
            .filter( name => name in data )
            .map( name => [name, data[name]] )
    );
}

/**
 * Composes several model form configs into one form.
 *
 * Each part keeps its own model's labels and placeholders: a field without an explicit label
 * resolves under `forms.{context.service}.fields`, so a composed form renders under one
 * formScope without copying another model's translation keys.
 *
 * @param configs - Model form configs, rendered in order.
 * @param context - Validation context for the whole form. Defaults to the first config's.
 */
export function composeFormConfigs( configs: FormConfig[], context = configs[0]?.context ): FormConfig
{
    const scoped = configs.map( config =>
    {
        const scope = config.context?.service as string | undefined;
        if( !scope ) return config;

        const scopeField = ( field: FormFieldConfig ): FormFieldConfig =>
        {
            const placeholderKey = `forms.${scope}.fields.${field.name}Placeholder`;

            return {
                ...field,
                label: field.label ?? { text: `forms.${scope}.fields.${field.name}` },
                placeholder: field.placeholder ?? ( i18n.exists( placeholderKey ) ? placeholderKey : undefined ),
            };
        };

        return {
            ...config,
            groups: config.groups.map( group => group.type === 'fields'
                ? { ...group, fields: group.fields.map( scopeField ) }
                : group ),
        };
    } );

    return {
        context,
        validationSchema: scoped
            .map( config => config.validationSchema )
            .filter( Boolean )
            .reduce( ( merged, schema ) => merged.concat( schema ) ),
        groups: scoped.flatMap( config => config.groups ),
    };
}
