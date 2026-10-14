/**
 * CountryModal
 *
 * Allows users to select their preferred country.
 * Demonstrates the reference data pattern:
 * - Context stores only the ID (current selection)
 * - Hook provides available options (service caches)
 * - Component renders selection without managing fetch
 */

import { useTranslation } from 'react-i18next';
import { Dialog, MenuItem, Typography, Box } from '@/components/ui';
import { useCountry } from '@/core/context';
import { useCountries } from '@/domains/system/hooks';
import { preferencesOrchestrator } from '@/domains/preferences';
import { formatApiError } from '@/core/utils';
import type { CountryId } from '@/core/types/ids';
import Spinner from '@/components/shared/spinner/Spinner';

interface CountryModalProps
{
    open: boolean;
    onClose: () => void;
}

export function CountryModal( { open, onClose }: CountryModalProps )
{
    const { t } = useTranslation();
    const { data: countries, isLoading, error: apiError } = useCountries();
    const { current: preselected } = useCountry();

    const handleSelect = ( id: CountryId ) =>
    {
        // Fire-and-forget: orchestrator updates context + persists if authenticated
        void preferencesOrchestrator.updateCountry( id );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t( 'preferences.country.title', 'Select Country' )}
            maxWidth="xs"
            fullWidth
        >
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Spinner />
                </Box>
            )}

            {apiError && (
                <Typography color="error" sx={{ py: 2 }}>
                    {formatApiError( t, apiError )}
                </Typography>
            )}

            {!isLoading && !apiError && countries && (
                <Box sx={{ py: 1 }}>
                    {countries.map( ( country ) => (
                        <MenuItem
                            key={country.id}
                            selected={country.id === preselected}
                            onClick={() => handleSelect( country.id as CountryId )}
                            sx={{ py: 1.25, px: 2 }}
                        >
                            {country.label}
                        </MenuItem>
                    ) )}
                </Box>
            )}
        </Dialog>
    );
}
