/**
 * LanguageModal
 *
 * Allows users to select their preferred language.
 * Demonstrates the reference data pattern:
 * - Context stores only the ID (current selection)
 * - Hook provides available options (service caches)
 * - Component renders selection without managing fetch
 */

import { useTranslation } from 'react-i18next';
import { Dialog, MenuItem, Typography, Box } from '@/components/ui';
import { useLanguage } from '@/core/context';
import { useLanguages } from '@/domains/system/hooks';
import { preferencesOrchestrator } from '@/domains/preferences';
import { formatApiError } from '@/core/utils';
import type { LanguageId } from '@/core/types/ids';
import Spinner from '@/components/shared/spinner/Spinner';

interface LanguageModalProps
{
    open: boolean;
    onClose: () => void;
}

export function LanguageModal( { open, onClose }: LanguageModalProps )
{
    const { t } = useTranslation();
    const { current: currentLanguageId } = useLanguage();
    const { data: languages, isLoading, error: apiError } = useLanguages();

    const handleSelect = ( id: LanguageId ) =>
    {
        // Fire-and-forget: orchestrator updates context + persists if authenticated
        void preferencesOrchestrator.updateLanguage( id );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t( 'preferences.language.title', 'Select Language' )}
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

            {!isLoading && !apiError && languages && (
                <Box sx={{ py: 1 }}>
                    {languages.map( ( lang ) => (
                        <MenuItem
                            key={lang.id}
                            selected={lang.id === currentLanguageId}
                            onClick={() => handleSelect( lang.id as LanguageId )}
                            sx={{ py: 1.25, px: 2 }}
                        >
                            {lang.label}
                        </MenuItem>
                    ) )}
                </Box>
            )}
        </Dialog>
    );
}
