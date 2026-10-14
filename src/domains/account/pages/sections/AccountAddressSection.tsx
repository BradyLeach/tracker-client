import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Card, Stack, Button, Skeleton, TextField } from '@/components/ui';
import { useCurrentAccount, useUpdateAddress } from '@/domains/account/account';
import type { Address } from '@/domains/account/account';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { formatApiError } from '@/core/utils';

type AddressFields = Pick<Address, 'line1' | 'line2' | 'city' | 'state' | 'postalCode'>;

export function AccountAddressSection()
{
    const { t } = useTranslation();
    const { data: account, isLoading, isError } = useCurrentAccount();
    const mutation = useUpdateAddress();
    const [draft, setDraft] = useState<Partial<AddressFields> | undefined>( undefined );

    if( isLoading )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Stack gap={2}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                </Stack>
            </Card>
        );
    }

    if( isError || !account )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Typography color="error">
                    {t( 'messages.error.loadFailed' )}
                </Typography>
            </Card>
        );
    }

    const address = account.address;

    if( !address )
    {
        return (
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t( 'pages.accountSettings.sections.address' )}
                </Typography>
                <Typography color="text.secondary">
                    {t( 'messages.info.noAddressOnFile' )}
                </Typography>
            </Card>
        );
    }

    const fields = draft ?? {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
    };

    const setField = ( key: keyof AddressFields ) => ( e: React.ChangeEvent<HTMLInputElement> ) =>
        setDraft( prev => ( { ...( prev ?? fields ), [key]: e.target.value } ) );

    const formError = mutation.error ? formatApiError( t, mutation.error ) : undefined;

    const handleSave = () =>
    {
        mutation.mutate( { id: address.id, data: fields } );
    };

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t( 'pages.accountSettings.sections.address' )}
            </Typography>
            <FormScaffold>
                <FormScaffold.Feedback message={formError} />
                <FormScaffold.Body>
                    <Stack spacing={2}>
                        <TextField label={t( 'shared.labels.addressLine1' )} value={fields.line1 ?? ''} onChange={setField( 'line1' )} fullWidth />
                        <TextField label={t( 'shared.labels.addressLine2' )} value={fields.line2 ?? ''} onChange={setField( 'line2' )} fullWidth />
                        <TextField label={t( 'shared.labels.city' )} value={fields.city ?? ''} onChange={setField( 'city' )} fullWidth />
                        <TextField label={t( 'shared.labels.state' )} value={fields.state ?? ''} onChange={setField( 'state' )} fullWidth />
                        <TextField label={t( 'shared.labels.postalCode' )} value={fields.postalCode ?? ''} onChange={setField( 'postalCode' )} fullWidth />
                        {address.country && (
                            <Stack spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">{t( 'shared.labels.country' )}</Typography>
                                <Typography variant="body1">{address.country.name}</Typography>
                            </Stack>
                        )}
                        {address.subdivision && (
                            <Stack spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">{t( 'shared.labels.subdivision' )}</Typography>
                                <Typography variant="body1">{address.subdivision.name}</Typography>
                            </Stack>
                        )}
                    </Stack>
                </FormScaffold.Body>
                <FormScaffold.Actions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? t( 'shared.interactions.loading' ) : t( 'shared.buttons.save' )}
                    </Button>
                </FormScaffold.Actions>
            </FormScaffold>
        </Card>
    );
}

export default AccountAddressSection;
