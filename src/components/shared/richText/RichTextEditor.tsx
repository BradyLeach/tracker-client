/**
 * RichTextEditor
 *
 * App-facing rich text input. Bold, italic, two list types and links — the set
 * a comment needs and nothing beyond it.
 *
 * The library lives behind `@/services/richText`; this component supplies what
 * the service refuses to know: the translated labels, and the character limit
 * the caller reads from config.
 *
 * @example
 * ```tsx
 * const [draft, setDraft] = useState( '' );
 *
 * <RichTextEditor
 *     value={draft}
 *     onChange={change => setDraft( change.value )}
 *     maxCharacters={getConfig().validation.comment.maxCharacters}
 * />
 * ```
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RichTextEditorImpl } from '@/services/richText/richText';
import type { RichTextChange, RichTextLabels } from '@/services/richText/richText';

export interface RichTextEditorProps
{
    /** Serialised document. An empty string is an empty document. */
    value: string;
    onChange: ( change: RichTextChange ) => void;
    placeholder?: string;
    /** Plain-text cap. Typing past it is refused rather than flagged. */
    maxCharacters?: number;
    /** One line until used: the toolbar and counter appear on focus or content. */
    compact?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    minHeight?: number | string;
    /** Ctrl/Cmd+Enter. Enter itself belongs to the document. */
    onSubmit?: () => void;
}

export function RichTextEditor( {
    value,
    onChange,
    placeholder,
    maxCharacters,
    compact,
    disabled,
    autoFocus,
    minHeight,
    onSubmit,
}: RichTextEditorProps )
{
    const { t } = useTranslation();

    const labels: RichTextLabels = useMemo( () => ( {
        bold: t( 'richText.bold' ),
        italic: t( 'richText.italic' ),
        bulletList: t( 'richText.bulletList' ),
        orderedList: t( 'richText.orderedList' ),
        link: t( 'richText.link' ),
        linkUrl: t( 'richText.linkUrl' ),
        linkApply: t( 'richText.linkApply' ),
        linkRemove: t( 'richText.linkRemove' ),
        linkInvalid: t( 'richText.linkInvalid' ),
        formatCounter: ( characters, limit ) => t( 'richText.counter', { characters, limit } ),
    } ), [t] );

    return (
        <RichTextEditorImpl
            value={value}
            onChange={onChange}
            labels={labels}
            placeholder={placeholder}
            maxCharacters={maxCharacters}
            compact={compact}
            disabled={disabled}
            autoFocus={autoFocus}
            minHeight={minHeight}
            onSubmit={onSubmit}
        />
    );
}

export default RichTextEditor;
