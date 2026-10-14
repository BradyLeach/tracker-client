/**
 * Rich Text Service - Types
 *
 * Library-agnostic. Nothing here names Tiptap, so swapping the editor is a
 * one-file change. The document crosses this boundary as a serialised string,
 * never as an editor node tree — app code stores it and never inspects it.
 */

export interface RichTextChange
{
    /** The serialised document. This is what gets stored. */
    value: string;
    /**
     * Plain-text length. The editor enforces its own limit; this is here so a
     * caller can disable a submit control without parsing the document.
     */
    characterCount: number;
    /** True when the document holds no text, however much markup surrounds it. */
    isEmpty: boolean;
}

/**
 * Toolbar and counter strings.
 *
 * Passed in rather than translated here: the service knows no i18n namespace,
 * the same way the map service takes its empty state as a node.
 */
export interface RichTextLabels
{
    bold: string;
    italic: string;
    bulletList: string;
    orderedList: string;
    link: string;
    /** Placeholder for the URL field. */
    linkUrl: string;
    linkApply: string;
    linkRemove: string;
    /** Shown when a URL fails the protocol allowlist. */
    linkInvalid: string;
    /** Renders the character counter, e.g. `1984 / 2000`. */
    formatCounter: ( count: number, limit: number ) => string;
}

export interface RichTextEditorProps
{
    /** Serialised document. An empty string is an empty document. */
    value: string;
    onChange: ( change: RichTextChange ) => void;
    labels: RichTextLabels;
    placeholder?: string;
    /**
     * Plain-text character cap. Typing past it is refused by the editor rather
     * than flagged afterwards. Omit for no limit.
     */
    maxCharacters?: number;
    /**
     * Holds the editor to one line until it is used: the toolbar and counter
     * appear once it takes focus or holds content, and fold away again when it
     * is left empty. For places where the editor sits beside the content it is
     * commenting on and must not crowd it.
     */
    compact?: boolean;
    /** Blocks editing without hiding the content. */
    disabled?: boolean;
    autoFocus?: boolean;
    /** The body's minimum height. The editor grows with its content. */
    minHeight?: number | string;
    /**
     * Ctrl/Cmd+Enter. Plain Enter belongs to the document — it splits a
     * paragraph or continues a list — so submitting needs its own chord.
     */
    onSubmit?: () => void;
}

export interface RichTextContentProps
{
    /** Serialised document, as stored. */
    value: string;
    /** Shown in place of the content when the document cannot be read. */
    errorMessage: string;
    /**
     * Called with the parse failure. Reported rather than logged here: the
     * service has no logger, and the caller knows which record broke.
     */
    onParseError?: ( error: unknown ) => void;
}
