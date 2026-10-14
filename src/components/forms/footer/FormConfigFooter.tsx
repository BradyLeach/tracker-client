import { Stack, Typography } from '@/components/ui';
import { SmartLink } from '@/components/shared/links/SmartLink';
import { useTranslation } from 'react-i18next';
import type { FormConfig } from '@/components/forms/types/formConfig.types';

/**
 * Props for FormConfigFooter component.
 */
export interface FormConfigFooterProps
{
    /** Form configuration containing footerLink */
    config: FormConfig;
}

/**
 * FormConfigFooter - Reusable footer for form configurations
 *
 * Renders footer link from FormConfig (e.g., "Already have an account? Sign In").
 * Used within FormScaffold.Footer slot for consistent footer rendering.
 *
 * @param props - Component props
 * @returns Footer link UI or null if no footerLink in config
 *
 * @example
 * ```tsx
 * <FormScaffold.Footer>
 *   <FormConfigFooter config={config} />
 * </FormScaffold.Footer>
 * ```
 */
export function FormConfigFooter( { config }: FormConfigFooterProps )
{
    const { t } = useTranslation();

    if( !config.footerLink ) return null;

    return (
        <Stack direction="row" spacing={1} justifyContent="center">
            <Typography color="text.secondary" variant="h6" fontWeight="400">
                {t( config.footerLink.prefaceText )}
            </Typography>
            <SmartLink
                href={config.footerLink.href}
                fontWeight="500"
                variant="h6"
                sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                }}
            >
                {t( config.footerLink.linkText )}
            </SmartLink>
        </Stack>
    );
}
