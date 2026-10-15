/**
 * IngestKeyDialog
 *
 * Creates an ingest key, or edits one. Pass `ingestKey` to open in edit mode; omit for
 * create.
 *
 * The key itself exists only in the create response — the server keeps a hash — so once a
 * key is created the dialog turns into the one place it is ever shown, with a copy action,
 * until the user closes it.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, Typography } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useMeasurementSources } from '@/domains/measurement';
import { useCreateIngestKey } from '../hooks/useCreateIngestKey';
import { useUpdateIngestKey } from '../hooks/useUpdateIngestKey';
import { buildIngestKeyFormConfig } from '../config/buildIngestKeyFormConfig';
import type { IngestKey } from '../types/ingestKey.types';

const FORM_ID = 'ingest-key-form';

/** The reserved source the push event API writes into. */
const PUSH_SOURCE_KEY = 'push';

export interface IngestKeyDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing key to edit it. */
    ingestKey?: IngestKey | null;
}

export function IngestKeyDialog( { open, onClose, ingestKey }: IngestKeyDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!ingestKey;
    const createMutation = useCreateIngestKey();
    const updateMutation = useUpdateIngestKey( ingestKey?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: sources = [] } = useMeasurementSources();
    const pushNames = sources.find( source => source.key === PUSH_SOURCE_KEY )?.allowedMeasurementNames ?? [];

    const [formKey, setFormKey] = useState( 0 );
    const [createdKey, setCreatedKey] = useState<string>();
    const [copied, setCopied] = useState( false );

    useEffect( () =>
    {
        if( !open ) return;
        setFormKey( key => key + 1 );
        setCreatedKey( undefined );
        setCopied( false );
    }, [open] );

    const config = buildIngestKeyFormConfig( pushNames, ingestKey ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const keyType = isEdit ? ingestKey?.keyType : data['keyType'];
        const names = Array.isArray( data['permittedMeasurementNames'] ) ? data['permittedMeasurementNames'] : [];

        const values: Record<string, unknown> = {
            label: String( data['label'] ?? '' ).trim(),
            // A secret key may push every event the push source allows, so it names none.
            permittedMeasurementNames: keyType === 'public' ? names : null,
        };

        if( isEdit )
        {
            await updateMutation.mutateAsync( values as Partial<IngestKey> );
            handleClose();
            return;
        }

        const created = await createMutation.mutateAsync( { ...values, keyType } as Partial<IngestKey> );
        setCreatedKey( created.key );
    };

    const copyKey = async () =>
    {
        if( !createdKey ) return;
        await navigator.clipboard.writeText( createdKey ).then( () => setCopied( true ) ).catch( () => undefined );
    };

    const handleClose = () =>
    {
        createMutation.reset();
        updateMutation.reset();
        onClose();
    };

    if( createdKey )
    {
        return (
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                title={t( 'forms.ingestKey.keyTitle' )}
                actions={
                    <>
                        <Button onClick={copyKey}>
                            {t( copied ? 'pages.ingestKeys.copied' : 'pages.ingestKeys.copyButton' )}
                        </Button>
                        <Button variant="contained" onClick={handleClose}>{t( 'pages.ingestKeys.doneButton' )}</Button>
                    </>
                }
            >
                <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                    {t( 'pages.ingestKeys.keyShownOnce' )}
                </Typography>
                <Box
                    component="code"
                    sx={{ display: 'block', p: 2, borderRadius: 1, backgroundColor: 'background.default', wordBreak: 'break-all' }}
                >
                    {createdKey}
                </Box>
            </Dialog>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( isEdit ? 'forms.ingestKey.editTitle' : 'forms.ingestKey.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button variant="contained" form={FORM_ID} type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.ingestKey.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? formatApiError( t, mutation.error ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={mutation.isPending}
                        formId={FORM_ID}
                        formScope="ingestKey"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
