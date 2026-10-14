import { useTranslation } from 'react-i18next';
import
{
    Dialog,
    Box,
    Typography,
    Switch,
} from '@/components/ui';
import { useTheme } from '@/core/context';
import { preferencesOrchestrator } from '@/domains/preferences';
import type { ThemeMode } from '@/core/utils/constants';

interface ThemeModalProps
{
    open: boolean;
    onClose: () => void;
}

export function ThemeModal( { open, onClose }: ThemeModalProps )
{
    const { t } = useTranslation();
    const { mode, themeName } = useTheme();

    const handleModeChange = ( e: React.ChangeEvent<HTMLInputElement> ) =>
        preferencesOrchestrator.updateTheme(
            ( e.target.checked ? 'dark' : 'light' ) as ThemeMode,
            themeName
        );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t( 'preferences.theme.title', 'Theme Settings' )}
            maxWidth="xs"
            fullWidth
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={600}>
                    {mode === 'dark'
                        ? t( 'preferences.theme.modeDark', 'Dark Mode' )
                        : t( 'preferences.theme.modeLight', 'Light Mode' )}
                </Typography>

                <Switch
                    checked={mode === 'dark'}
                    onChange={handleModeChange}
                    inputProps={{ 'aria-label': 'Theme mode' }}
                />
            </Box>

        </Dialog >
    );
}
