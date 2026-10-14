/**
 * Tiptap Implementation of the Rich Text Service
 *
 * The ONLY file that knows about Tiptap. Swap this file to change editor
 * library without touching app code.
 *
 * Five Tiptap specifics handled here rather than leaking outward:
 *
 * - The document crosses the boundary as a JSON string. Callers store it and
 *   never see a node tree, so the stored shape is this file's concern alone.
 * - The editor instance is created once and its options close over the render
 *   that made it, so the caller's handlers are held in refs.
 * - ProseMirror ships no styling. The content area, lists and placeholder are
 *   dressed here, in theme tokens.
 * - Links are restricted to an explicit protocol allowlist on the way in, and
 *   the same allowlist strips marks on the way out — a document is data from
 *   the server, and `javascript:` in an href is a click away from running.
 * - Enter belongs to the document: it splits a paragraph and continues a list.
 *   Submitting is Mod-Enter, added as a one-shortcut extension.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Extension, type Extensions, type JSONContent } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import { Box, Button, IconButton, IconRenderer, TextField, Tooltip, Typography } from '@/components/ui';
import type { IconKey } from '@/components/ui';
import type { RichTextContentProps, RichTextEditorProps } from './richText.types';

/** The only schemes a link may carry, entering or leaving. */
const ALLOWED_PROTOCOLS = ['http', 'https', 'mailto'];

/** A URL written without a scheme is assumed to be one of these. */
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

const EMPTY_DOCUMENT: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

/** Bare `example.com` is what people type; it is not a protocol violation. */
function normaliseUrl( raw: string ): string
{
    const trimmed = raw.trim();
    return SCHEME_PATTERN.test( trimmed ) ? trimmed : `https://${trimmed}`;
}

function isAllowedUrl( url: string | undefined ): boolean
{
    if( !url ) return false;

    try
    {
        // Resolved against the origin so a relative href parses rather than throws.
        const { protocol } = new URL( url, window.location.origin );
        return ALLOWED_PROTOCOLS.includes( protocol.replace( ':', '' ) );
    }
    catch
    {
        return false;
    }
}

/**
 * Reads a stored document, strictly.
 *
 * Anything that is not a Tiptap document throws rather than rendering as
 * nothing: a body that cannot be read is a fault worth seeing, not an empty
 * comment.
 */
function parseDocument( value: string ): JSONContent
{
    const parsed: unknown = JSON.parse( value );

    if( typeof parsed !== 'object' || parsed === undefined || parsed === null || ( parsed as JSONContent ).type !== 'doc' )
    {
        throw new Error( 'Rich text value is not a document' );
    }

    return parsed as JSONContent;
}

/** Tolerant read for the editor, whose content is the caller's own draft. */
function readDraft( value: string ): JSONContent
{
    if( value.trim().length === 0 ) return EMPTY_DOCUMENT;

    try
    {
        return parseDocument( value );
    }
    catch
    {
        return EMPTY_DOCUMENT;
    }
}

/** Drops link marks whose href is outside the allowlist, at any depth. */
function stripUnsafeLinks( node: JSONContent ): JSONContent
{
    const marks = node.marks?.filter( mark => mark.type !== 'link' || isAllowedUrl( mark.attrs?.href as string | undefined ) );

    return {
        ...node,
        ...( node.marks ? { marks } : {} ),
        ...( node.content ? { content: node.content.map( stripUnsafeLinks ) } : {} ),
    };
}

/**
 * Bold, italic, the two lists and links. Everything else StarterKit offers is
 * switched off here rather than merely left out of the toolbar — an extension
 * left on is reachable by paste and by keyboard shortcut.
 */
function buildExtensions( options: { limit?: number; placeholder?: string } = {} ): Extensions
{
    return [
        StarterKit.configure( {
            blockquote: false,
            code: false,
            codeBlock: false,
            heading: false,
            horizontalRule: false,
            strike: false,
            underline: false,
            link: {
                openOnClick: false,
                defaultProtocol: 'https',
                protocols: ALLOWED_PROTOCOLS,
                isAllowedUri: url => isAllowedUrl( url ),
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
            },
        } ),
        // autoTrim off: a document that arrives over the limit is shown whole
        // with the counter in error. Silently cutting text the author already
        // wrote is worse than refusing the next keystroke.
        CharacterCount.configure( { limit: options.limit, autoTrim: false } ),
        Placeholder.configure( { placeholder: options.placeholder ?? '' } ),
    ];
}

/** One schema for reading stored documents; no limit and no placeholder apply. */
const RENDER_EXTENSIONS = buildExtensions();

/** Content styling, shared by the editor body and the read-only render. */
const proseSx = {
    '& p': { margin: 0 },
    '& p + p': { marginTop: 1 },
    '& ul, & ol': { margin: 0, paddingLeft: 3 },
    '& li + li': { marginTop: 0.25 },
    '& a': { color: 'primary.main', textDecoration: 'underline' },
    wordBreak: 'break-word',
} as const;

function ToolbarButton( {
    iconKey,
    label,
    active,
    disabled,
    onClick,
}: {
    iconKey: IconKey;
    label: string;
    active: boolean;
    disabled: boolean;
    onClick: () => void;
} )
{
    return (
        // The span carries the tooltip while the button is disabled: a disabled
        // control fires no pointer events of its own.
        <Tooltip title={label}>
            <span>
                <IconButton
                    size="small"
                    aria-label={label}
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={onClick}
                    sx={{ color: active ? 'primary.main' : 'text.secondary', borderRadius: 1 }}
                >
                    <IconRenderer iconKey={iconKey} size={18} />
                </IconButton>
            </span>
        </Tooltip>
    );
}

export function TiptapRichTextEditor( {
    value,
    onChange,
    labels,
    placeholder,
    maxCharacters,
    compact = false,
    disabled = false,
    autoFocus = false,
    minHeight = 96,
    onSubmit,
}: RichTextEditorProps )
{
    const changeRef = useRef( onChange );
    changeRef.current = onChange;

    const submitRef = useRef( onSubmit );
    submitRef.current = onSubmit;

    // What this editor last sent upward. Anything else arriving in `value` is
    // the caller replacing the document — a cleared draft — and is applied.
    const emitted = useRef( value );

    const [focused, setFocused] = useState( false );
    const [linkOpen, setLinkOpen] = useState( false );
    const [linkDraft, setLinkDraft] = useState( '' );
    const [linkRejected, setLinkRejected] = useState( false );

    const extensions = useMemo( () => [
        ...buildExtensions( { limit: maxCharacters, placeholder } ),
        Extension.create( {
            name: 'submitShortcut',
            addKeyboardShortcuts()
            {
                return {
                    'Mod-Enter': () =>
                    {
                        submitRef.current?.();
                        return true;
                    },
                };
            },
        } ),
    ], [maxCharacters, placeholder] );

    const editor = useEditor( {
        extensions,
        content: readDraft( value ),
        editable: !disabled,
        autofocus: autoFocus,
        onFocus()
        {
            setFocused( true );
        },
        onBlur()
        {
            setFocused( false );
        },
        onUpdate( { editor: instance } )
        {
            // An empty document serialises to nothing, so "no comment" is one
            // value rather than an empty paragraph the caller has to recognise.
            const next = instance.isEmpty ? '' : JSON.stringify( instance.getJSON() );

            emitted.current = next;
            changeRef.current( {
                value: next,
                characterCount: instance.storage.characterCount?.characters() ?? 0,
                isEmpty: instance.isEmpty,
            } );
        },
    }, [extensions] );

    const state = useEditorState( {
        editor,
        selector: ( { editor: instance } ) => ( {
            bold: instance?.isActive( 'bold' ) ?? false,
            italic: instance?.isActive( 'italic' ) ?? false,
            bulletList: instance?.isActive( 'bulletList' ) ?? false,
            orderedList: instance?.isActive( 'orderedList' ) ?? false,
            link: instance?.isActive( 'link' ) ?? false,
            empty: instance?.isEmpty ?? true,
            // The selector can run against an instance that is being replaced —
            // a changed limit or placeholder rebuilds the editor — and reads its
            // storage before the extensions have registered any.
            characters: instance?.storage.characterCount?.characters() ?? 0,
        } ),
    } );

    useEffect( () =>
    {
        if( !editor ) return;
        if( value === emitted.current ) return;

        emitted.current = value;
        editor.commands.setContent( readDraft( value ), { emitUpdate: false } );
    }, [editor, value] );

    useEffect( () =>
    {
        editor?.setEditable( !disabled );
    }, [editor, disabled] );

    // Returning focus once the link row has gone: the field holding focus is
    // unmounted with it, which drops focus to the body and sends the author's
    // next keystroke nowhere. An effect, so this runs after the DOM commit.
    const linkWasOpen = useRef( false );

    useEffect( () =>
    {
        if( linkWasOpen.current && !linkOpen ) editor?.commands.focus();
        linkWasOpen.current = linkOpen;
    }, [linkOpen, editor] );

    const closeLink = useCallback( () =>
    {
        setLinkOpen( false );
        setLinkDraft( '' );
        setLinkRejected( false );
    }, [] );

    const openLink = useCallback( () =>
    {
        if( !editor ) return;

        setLinkDraft( ( editor.getAttributes( 'link' ).href as string | undefined ) ?? '' );
        setLinkRejected( false );
        setLinkOpen( true );
    }, [editor] );

    const applyLink = useCallback( () =>
    {
        if( !editor ) return;

        const href = normaliseUrl( linkDraft );

        if( !isAllowedUrl( href ) )
        {
            setLinkRejected( true );
            return;
        }

        editor.chain().focus().extendMarkRange( 'link' ).setLink( { href } ).run();
        closeLink();
    }, [editor, linkDraft, closeLink] );

    const removeLink = useCallback( () =>
    {
        editor?.chain().focus().extendMarkRange( 'link' ).unsetLink().run();
        closeLink();
    }, [editor, closeLink] );

    const characters = state?.characters ?? 0;
    const atLimit = maxCharacters !== undefined && characters >= maxCharacters;

    // Compact folds the chrome away until the editor is in use. Content keeps it
    // open after a blur: a draft with formatting must not lose the controls that
    // made it.
    const showChrome = !compact || focused || linkOpen || !( state?.empty ?? true );

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'border.base',
                borderRadius: 1,
                backgroundColor: 'background.paper',
            }}
        >
            {showChrome && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.25,
                        px: 0.5,
                        py: 0.25,
                        borderBottom: '1px solid',
                        borderColor: 'border.base',
                    }}
                >
                    <ToolbarButton
                        iconKey="bold"
                        label={labels.bold}
                        active={state?.bold ?? false}
                        disabled={disabled}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    />
                    <ToolbarButton
                        iconKey="italic"
                        label={labels.italic}
                        active={state?.italic ?? false}
                        disabled={disabled}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    />
                    <ToolbarButton
                        iconKey="list"
                        label={labels.bulletList}
                        active={state?.bulletList ?? false}
                        disabled={disabled}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    />
                    <ToolbarButton
                        iconKey="listNumbers"
                        label={labels.orderedList}
                        active={state?.orderedList ?? false}
                        disabled={disabled}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    />
                    <ToolbarButton
                        iconKey="link"
                        label={labels.link}
                        active={state?.link ?? false}
                        disabled={disabled}
                        onClick={openLink}
                    />
                </Box>
            )}

            {linkOpen && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        px: 1,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'border.base',
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        autoFocus
                        value={linkDraft}
                        placeholder={labels.linkUrl}
                        error={linkRejected}
                        helperText={linkRejected ? labels.linkInvalid : undefined}
                        onChange={event =>
                        {
                            setLinkDraft( event.target.value );
                            setLinkRejected( false );
                        }}
                        onKeyDown={event =>
                        {
                            if( event.key === 'Enter' )
                            {
                                event.preventDefault();
                                applyLink();
                            }
                            if( event.key === 'Escape' ) closeLink();
                        }}
                    />
                    <Button size="small" variant="contained" onClick={applyLink} sx={{ flexShrink: 0, mt: 0.25 }}>
                        {labels.linkApply}
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={removeLink}
                        disabled={!( state?.link ?? false )}
                        sx={{ flexShrink: 0, mt: 0.25 }}
                    >
                        {labels.linkRemove}
                    </Button>
                </Box>
            )}

            <Box
                sx={{
                    px: 1.5,
                    py: 1,
                    ...proseSx,
                    '& .ProseMirror': { outline: 'none', minHeight },
                    // The placeholder is an attribute on the empty first node,
                    // not a DOM node of its own.
                    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
                        content: 'attr(data-placeholder)',
                        float: 'left',
                        height: 0,
                        pointerEvents: 'none',
                        color: 'text.disabled',
                    },
                }}
            >
                <EditorContent editor={editor} />
            </Box>

            {showChrome && maxCharacters !== undefined && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.5, pb: 0.75 }}>
                    <Typography variant="caption" color={atLimit ? 'error.main' : 'text.secondary'}>
                        {labels.formatCounter( characters, maxCharacters )}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export function TiptapRichTextContent( { value, errorMessage, onParseError }: RichTextContentProps )
{
    const errorRef = useRef( onParseError );
    errorRef.current = onParseError;

    const rendered = useMemo( () =>
    {
        if( value.trim().length === 0 ) return { element: undefined, error: undefined };

        try
        {
            const document = stripUnsafeLinks( parseDocument( value ) );
            return {
                element: renderToReactElement( { content: document, extensions: RENDER_EXTENSIONS } ),
                error: undefined,
            };
        }
        catch ( error )
        {
            return { element: undefined, error };
        }
    }, [value] );

    useEffect( () =>
    {
        if( rendered.error !== undefined ) errorRef.current?.( rendered.error );
    }, [rendered.error] );

    if( rendered.error !== undefined )
    {
        return (
            <Typography variant="body2" color="error.main">
                {errorMessage}
            </Typography>
        );
    }

    return <Box sx={proseSx}>{rendered.element}</Box>;
}
