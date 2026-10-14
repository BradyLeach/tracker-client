/**
 * RichTextContent
 *
 * Renders a stored document read-only, as React elements — never as an HTML
 * string, so nothing reaches the DOM through `dangerouslySetInnerHTML`.
 *
 * A document that cannot be read shows a short message and logs the failure.
 * Throwing would take the whole thread down for one bad row, and rendering
 * nothing would hide it.
 */

import { useTranslation } from 'react-i18next';
import { RichTextContentImpl } from '@/services/richText/richText';
import { logger } from '@/core/utils/logger';

export interface RichTextContentProps
{
    /** Serialised document, as stored. */
    value: string;
    /** Overrides the generic failure message where the caller knows the record. */
    errorMessage?: string;
}

export function RichTextContent( { value, errorMessage }: RichTextContentProps )
{
    const { t } = useTranslation();

    return (
        <RichTextContentImpl
            value={value}
            errorMessage={errorMessage ?? t( 'richText.unavailable' )}
            onParseError={error => logger.error( 'Rich text document could not be read', { error, value } )}
        />
    );
}

export default RichTextContent;
