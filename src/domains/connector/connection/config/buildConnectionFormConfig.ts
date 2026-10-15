/**
 * buildConnectionFormConfig
 *
 * Form config for connecting a tool or editing a connection. Pass defaults to pre-populate
 * fields from an existing connection; without an id the config is for create.
 *
 * The connector is chosen from the catalog — the connectors this deployment configures —
 * and is fixed once created, so an edit form leaves it out. Fields and validation come from
 * the model definition.
 */

import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { Connection, ConnectorDescriptor } from '../types/connection.types';

const CREATE_FIELDS = ['connectorName', 'label', 'isActive', 'pullIntervalMinutes'];
const UPDATE_FIELDS = CREATE_FIELDS.filter( key => key !== 'connectorName' );

export function buildConnectionFormConfig( catalog: readonly ConnectorDescriptor[], defaults?: Partial<Connection> ): FormConfig
{
    const formFields = defaults?.id ? UPDATE_FIELDS : CREATE_FIELDS;

    const allFields = formFieldFactory.getFormFields( 'connection' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'connection' ).pick( formFields );

    const presetValues: Partial<Connection> = defaults ?? {};

    const fields: FormFieldConfig[] = formFields
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof Connection] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field => field.name === 'connectorName'
            ? {
                ...field,
                type: 'select',
                options: catalog.map( connector => ( { value: connector.name, label: connector.name } ) ),
            }
            : field );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'connection',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}
