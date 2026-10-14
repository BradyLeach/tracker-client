/**
 * CreatePartnershipDialog
 *
 * Handles both create and edit modes for a partnership.
 * Pass `partnership` to open in edit mode with pre-populated fields.
 * Omit `partnership` (or pass null) for create mode.
 *
 * Create against an existing company by passing `companyId` — the form is the partnership
 * alone. Without one, the company's own form config is composed in and submit chains
 * company → partnership.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Box, IconButton, Menu, MenuItem } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { composeFormConfigs, pickFieldValues } from '@/components/forms/utils/formUtils';
import { useCreateCompany, buildCompanyFormConfig } from '../../company';
import type { Company } from '../../company';
import { useCreatePartnership } from '../hooks/useCreatePartnership';
import { useUpdatePartnership } from '../hooks/useUpdatePartnership';
import { buildCreatePartnershipFormConfig } from '../config/buildCreatePartnershipFormConfig';
import { DeletePartnershipDialog } from './DeletePartnershipDialog';
import type { Partnership } from '../types/partnership.types';

export interface CreatePartnershipDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing partnership to open in edit mode. */
    partnership?: Partnership | null;
    /** Create against this company. Omit to create the company in the same form. */
    companyId?: string;
}

export function CreatePartnershipDialog( { open, onClose, partnership, companyId }: CreatePartnershipDialogProps )
{
    const { t } = useTranslation();

    const isEdit = partnership != null;
    const formId = isEdit ? 'partnership-form-edit' : 'partnership-form-create';

    const createCompany = useCreateCompany();
    const createMutation = useCreatePartnership();
    const updateMutation = useUpdatePartnership( partnership?.id ?? '' );

    const mutations = isEdit ? [updateMutation] : [createCompany, createMutation];
    const isPending = mutations.some( mutation => mutation.isPending );
    const error = mutations.find( mutation => mutation.error )?.error;
    const reset = () => mutations.forEach( mutation => mutation.reset() );

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( k => k + 1 ); }, [open] );

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [confirmingDelete, setConfirmingDelete] = useState( false );

    const defaults: Record<string, unknown> | undefined = isEdit ? {
        partnershipTypeId: partnership.partnershipTypeId,
        contactName: partnership.contactName,
        contactEmail: partnership.contactEmail,
        contactPhone: partnership.contactPhone,
        rating: partnership.rating,
    } : undefined;

    const partnershipConfig = buildCreatePartnershipFormConfig( defaults );
    const companyConfig = buildCompanyFormConfig();

    // Without a company to attach to, the company's own form is composed in ahead of the partnership.
    const config = isEdit || companyId
        ? partnershipConfig
        : composeFormConfigs( [companyConfig, partnershipConfig] );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const partnershipData = pickFieldValues( partnershipConfig, data ) as Partial<Partnership>;

        if( isEdit )
        {
            await updateMutation.mutateAsync( partnershipData );
        }
        else
        {
            const resolvedCompanyId = companyId
                ?? ( await createCompany.mutateAsync( pickFieldValues( companyConfig, data ) as Partial<Company> ) ).id;

            await createMutation.mutateAsync( { ...partnershipData, companyId: resolvedCompanyId } );
        }

        handleClose();
    };

    const handleClose = () =>
    {
        reset();
        setMenuAnchor( null );
        setConfirmingDelete( false );
        onClose();
    };

    const handleDeleteClick = () =>
    {
        setMenuAnchor( null );
        setConfirmingDelete( true );
    };

    const title = isEdit
        ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{t( 'forms.partnership.editTitle' )}</span>
                <IconButton
                    size="small"
                    aria-label={t( 'shared.buttons.moreActions' )}
                    aria-haspopup="true"
                    aria-expanded={menuAnchor ? 'true' : undefined}
                    onClick={( event ) => setMenuAnchor( event.currentTarget )}
                >
                    <IconRenderer iconKey="dotsVertical" size={18} />
                </IconButton>
            </Box>
        )
        : t( 'forms.partnership.title' );

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                title={title}
                actions={
                    <>
                        <Button onClick={handleClose} disabled={isPending}>
                            {t( 'shared.buttons.cancel' )}
                        </Button>
                        <Button
                            variant="contained"
                            form={formId}
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending
                                ? t( 'shared.interactions.saving' )
                                : t( isEdit ? 'shared.buttons.save' : 'forms.partnership.submitButton' )}
                        </Button>
                    </>
                }
            >
                <FormScaffold>
                    <FormScaffold.Feedback message={error ? t( error.key ) : undefined} />
                    <FormScaffold.Body>
                        <BaseFormRenderer
                            key={formKey}
                            config={config}
                            onSubmit={handleSubmit}
                            loading={isPending}
                            formId={formId}
                            formScope="partnership"
                        />
                    </FormScaffold.Body>
                </FormScaffold>
            </Dialog>

            {isEdit && (
                <>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean( menuAnchor )}
                        onClose={() => setMenuAnchor( null )}
                    >
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'danger.main', gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'shared.buttons.delete' )}
                        </MenuItem>
                    </Menu>

                    <DeletePartnershipDialog
                        open={confirmingDelete}
                        onClose={() => setConfirmingDelete( false )}
                        partnership={partnership ?? null}
                        onDeleted={handleClose}
                    />
                </>
            )}
        </>
    );
}
