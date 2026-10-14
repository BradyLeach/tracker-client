/**
 * Rich Text Translations
 *
 * The editor is entity-agnostic — a comment today, a note or a description
 * later — so its strings say what the control does and never what it edits.
 */
const richText =
    {
        bold: "Bold",
        italic: "Italic",
        bulletList: "Bulleted list",
        orderedList: "Numbered list",
        link: "Link",
        linkUrl: "https://example.com",
        linkApply: "Apply",
        linkRemove: "Remove",
        linkInvalid: "Enter a web or email address.",
        // Not `count`: that name puts i18next into plural selection, which this
        // string does not want.
        counter: "{{characters}} / {{limit}}",
        unavailable: "Unable to display content.",
    } as const;

export default richText;
