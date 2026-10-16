/**
 * ConnectionDialog
 *
 * Connects a tool, or edits a connection. Pass `connection` to open in edit mode; omit for
 * create. Creating a connection backfills the connector's history and, when scheduled,
 * keeps pulling from there.
 *
 * The connector is chosen above the form on create, and the form is rebuilt for it: its
 * settings and credentials are the fields its declaration lists. Credentials are never read
 * back, so editing sends them only when every one is entered again; blank keeps the stored
 * ones. The server's error key shows in the form's feedback slot.
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, MenuItem, Select, Typography } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useConnectorCatalog } from '../hooks/useConnectorCatalog';
import { useCreateConnection } from '../hooks/useCreateConnection';
import { useUpdateConnection } from '../hooks/useUpdateConnection';
import { buildConnectionFormConfig } from '../config/buildConnectionFormConfig';
import type { Connection, ConnectorField } from '../types/connection.types';

const FORM_ID = 'connection-form';

export interface ConnectionDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing connection to edit it. */
    connection?: Connection | null;
    /** Called with the new connection's id once it is created. */
    onCreated?: ( connectionId: string ) => void;
}

/** A blank entry is not a value: '' from a text field, NaN or '' from a number, [] from a list. */
function isBlank( value: unknown ): boolean
{
    return value === undefined || value === null || value === '' ||
        ( typeof value === 'number' && Number.isNaN( value ) ) ||
        ( Array.isArray( value ) && value.length === 0 );
}

/** The declared fields' entered values, numbers as numbers, blanks left out. */
function enteredValues( fields: ConnectorField[], entered: unknown ): Record<string, unknown>
{
    const values = ( entered ?? {} ) as Record<string, unknown>;

    return Object.fromEntries( fields
        .map( field =>
        {
            const value = values[field.key];
            return [field.key, field.type === 'number' && !isBlank( value ) ? Number( value ) : value] as const;
        } )
        .filter( ( [, value] ) => !isBlank( value ) ) );
}

export function ConnectionDialog( { open, onClose, connection, onCreated }: ConnectionDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!connection;
    const createMutation = useCreateConnection();
    const updateMutation = useUpdateConnection( connection?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: catalog = [] } = useConnectorCatalog();

    const [connectorName, setConnectorName] = useState( '' );

    /** Remounts the renderer and re-seeds the choice, so a reopened dialog starts from the record. */
    const [formKey, setFormKey] = useState( 0 );
    useEffect( () =>
    {
        if( !open ) return;
        setFormKey( key => key + 1 );
        setConnectorName( connection?.connectorName ?? '' );
    }, [open, connection] );

    const connector = catalog.find( descriptor => descriptor.name === connectorName );

    const config = useMemo(
        () => connector ? buildConnectionFormConfig( connector, connection ?? undefined ) : undefined,
        [connector, connection],
    );

    // A different connector is a different set of settings and credentials.
    const chooseConnector = ( next: string ) =>
    {
        setConnectorName( next );
        setFormKey( key => key + 1 );
    };

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        if( !connector ) return;

        const { settingFields, credentialFields } = connector.declaration;
        const credentials = enteredValues( credentialFields, data['credentials'] );
        const hasAllCredentials = credentialFields.every( field => field.optional || field.key in credentials );

        const values: Record<string, unknown> = {
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : null,
            isActive: data['isActive'] === true,
            pullIntervalMinutes: Number( data['pullIntervalMinutes'] ),
            settings: enteredValues( settingFields, data['settings'] ),
            // Credentials replace the stored ones whole, so a partial entry is not sent.
            ...( credentialFields.length && hasAllCredentials ? { credentials } : {} ),
        };

        if( isEdit )
        {
            await updateMutation.mutateAsync( values as Partial<Connection> );
        }
        else
        {
            const created = await createMutation.mutateAsync( { ...values, connectorName } as Partial<Connection> );
            onCreated?.( created.id );
        }

        handleClose();
    };

    const handleClose = () =>
    {
        createMutation.reset();
        updateMutation.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( isEdit ? 'forms.connection.editTitle' : 'forms.connection.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button variant="contained" form={FORM_ID} type="submit" disabled={mutation.isPending || !connector}>
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.connection.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? formatApiError( t, mutation.error ) : undefined} />
                {!isEdit && (
                    <FormScaffold.Message>
                        <Typography variant="subtitle2" gutterBottom>{t( 'forms.connection.fields.connectorName' )}</Typography>
                        <Select
                            size="small"
                            fullWidth
                            displayEmpty
                            value={connectorName}
                            disabled={mutation.isPending}
                            onChange={event => chooseConnector( String( event.target.value ) )}
                        >
                            <MenuItem value="" disabled>{t( 'forms.connection.fields.connectorNamePlaceholder' )}</MenuItem>
                            {catalog.map( descriptor => (
                                <MenuItem key={descriptor.name} value={descriptor.name}>{descriptor.name}</MenuItem>
                            ) )}
                        </Select>
                    </FormScaffold.Message>
                )}
                {config && (
                    <FormScaffold.Body>
                        <BaseFormRenderer
                            key={formKey}
                            config={config}
                            onSubmit={handleSubmit}
                            loading={mutation.isPending}
                            formId={FORM_ID}
                            formScope="connection"
                        />
                    </FormScaffold.Body>
                )}
            </FormScaffold>
        </Dialog>
    );
}
