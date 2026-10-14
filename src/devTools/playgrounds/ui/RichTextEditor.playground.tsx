/**
 * RichTextEditor Playground
 *
 * The editor is library-agnostic to app code: this file imports no Tiptap, only
 * `RichTextEditor`, `RichTextContent` and serialised documents. Swapping the
 * implementation in `@/services/richText` should leave this tab unchanged.
 *
 * The fixtures are written as stored documents — the same JSON a comment row
 * holds — so what is seeded here is exactly what comes back from the API.
 */

import { useState } from 'react';
import { Box, Divider, Stack, Typography } from '@/components/ui';
import { RichTextEditor, RichTextContent } from '@/components/shared/richText';
import type { RichTextChange } from '@/components/shared/richText';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Every mark and both list types, in one document. */
const FORMATTED_DOCUMENT = JSON.stringify( {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'Batch 42 came out ' },
                { type: 'text', marks: [{ type: 'bold' }], text: 'firmer than expected' },
                { type: 'text', text: ', and the scent is ' },
                { type: 'text', marks: [{ type: 'italic' }], text: 'much' },
                { type: 'text', text: ' lighter. Notes are in the ' },
                {
                    type: 'text',
                    marks: [{ type: 'link', attrs: { href: 'https://example.com/batch-42' } }],
                    text: 'run sheet',
                },
                { type: 'text', text: '.' },
            ],
        },
        {
            type: 'bulletList',
            content: [
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cure time: 4 weeks' }] }] },
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Lye discount: 6%' }] }] },
            ],
        },
        {
            type: 'orderedList',
            content: [
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Re-weigh the oils' }] }] },
                { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Log the trace time' }] }] },
            ],
        },
    ],
} );

/**
 * A short limit makes the boundary visible without typing two thousand
 * characters, and taking the limit from the text guarantees "at limit" is exact.
 */
const AT_LIMIT_TEXT = 'This note sits exactly on the limit, so the counter reads full and the next keystroke is refused outright.';
const SHORT_LIMIT = AT_LIMIT_TEXT.length;

const OVER_LIMIT_TEXT =
    'This note arrived longer than the limit allows, which happens when a limit is lowered after the fact. '
    + 'It is shown whole, in error, rather than quietly cut.';

function paragraphDocument( text: string ): string
{
    return JSON.stringify( { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } );
}

/** Not a document. Exercises the read-only failure path. */
const BROKEN_DOCUMENT = 'Just a plain string that was never a document.';

// ─── Playground ───────────────────────────────────────────────────────────────

function SectionLabel( { children }: { children: React.ReactNode } )
{
    return (
        <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}
        >
            {children}
        </Typography>
    );
}

function EditorDemo( {
    label,
    initialValue = '',
    maxCharacters,
    width,
    compact,
}: {
    label: string;
    initialValue?: string;
    maxCharacters?: number;
    width?: number;
    compact?: boolean;
} )
{
    const [change, setChange] = useState<RichTextChange>( {
        value: initialValue,
        characterCount: 0,
        isEmpty: initialValue.length === 0,
    } );

    return (
        <Box sx={{ maxWidth: width }}>
            <SectionLabel>{label}</SectionLabel>

            <RichTextEditor
                value={change.value}
                onChange={setChange}
                maxCharacters={maxCharacters}
                compact={compact}
                minHeight={compact ? 24 : undefined}
                placeholder="Add a comment..."
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {change.characterCount} characters · {change.isEmpty ? 'empty' : 'has content'}
            </Typography>
        </Box>
    );
}

export function RichTextEditorPlayground()
{
    // The round-trip: what the editor emits is what the read-only renderer is
    // given, with no transform in between.
    const [roundTrip, setRoundTrip] = useState<RichTextChange>( {
        value: FORMATTED_DOCUMENT,
        characterCount: 0,
        isEmpty: false,
    } );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>RichTextEditor</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Bold, italic, both list types and links, with the library hidden behind{' '}
                <code>@/services/richText</code>. The value crossing the boundary is a serialised
                document — the same string a comment row stores. Enter continues a list;
                Ctrl/Cmd+Enter is the submit chord the caller wires up.
            </Typography>

            <Stack spacing={4}>
                <EditorDemo label="Empty — placeholder and live count" maxCharacters={2000} />
                <Divider />
                <EditorDemo
                    label="Compact — one line until focused; chrome stays while it holds content"
                    maxCharacters={2000}
                    compact
                    width={520}
                />
                <Divider />
                <EditorDemo label="Every mark and list type" initialValue={FORMATTED_DOCUMENT} maxCharacters={2000} />
                <Divider />
                <EditorDemo
                    label={`At the limit (${SHORT_LIMIT}) — typing is refused, counter in error`}
                    initialValue={paragraphDocument( AT_LIMIT_TEXT )}
                    maxCharacters={SHORT_LIMIT}
                />
                <Divider />
                <EditorDemo
                    label={`Over the limit (${SHORT_LIMIT}) — shown whole, not trimmed`}
                    initialValue={paragraphDocument( OVER_LIMIT_TEXT )}
                    maxCharacters={SHORT_LIMIT}
                />
                <Divider />
                <EditorDemo
                    label="Narrow — as in the profile panel"
                    initialValue={FORMATTED_DOCUMENT}
                    maxCharacters={2000}
                    width={420}
                />
                <Divider />

                <Box>
                    <SectionLabel>Read-only — a stored document</SectionLabel>
                    <RichTextContent value={FORMATTED_DOCUMENT} />
                </Box>

                <Box>
                    <SectionLabel>Read-only — a value that is not a document</SectionLabel>
                    <RichTextContent value={BROKEN_DOCUMENT} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        The parse failure is logged with the offending value; the thread around it keeps rendering.
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <SectionLabel>Round trip — edit on the left, the emitted value rendered on the right</SectionLabel>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: '1 1 380px', minWidth: 320 }}>
                            <RichTextEditor
                                value={roundTrip.value}
                                onChange={setRoundTrip}
                                maxCharacters={2000}
                                placeholder="Add a comment..."
                            />
                        </Box>

                        <Box
                            sx={{
                                flex: '1 1 380px',
                                minWidth: 320,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'border.base',
                                borderRadius: 1,
                                backgroundColor: 'background.sunk',
                            }}
                        >
                            <RichTextContent value={roundTrip.value} />
                        </Box>
                    </Box>
                </Box>
            </Stack>

            <PlaygroundDataPreview
                title="Emitted document"
                caption="What the editor above emits, and what the panel beside it renders. This string is the stored comment body."
                data={roundTrip.value.length > 0 ? JSON.parse( roundTrip.value ) : {}}
            />
        </Box>
    );
}

export default RichTextEditorPlayground;
