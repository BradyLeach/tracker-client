/**
 * CommentThread Playground
 *
 * Comments are polymorphic on the backend, so the thread takes a plain
 * `CommentEntry[]` and knows nothing about what they hang off. These fixtures
 * are deliberately unordered to show the thread sorting newest-first itself.
 *
 * Covers the states a real record produces: empty, a handful, a long body, and
 * enough comments to page.
 */

import { useState } from 'react';
import { Box, Stack, Typography, Divider } from '@/components/ui';
import { CommentThread } from '@/components/shared/comments';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import type { CommentEntry } from '@/components/shared/comments';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// Fixed offsets from a fixed anchor, not Date.now(), so the ordering under
// test never changes. The rendered wording still moves with the real clock.

const NOW = new Date( '2026-08-11T09:00:00Z' ).getTime();
const hoursAgo = ( hours: number ) => new Date( NOW - hours * 3_600_000 ).toISOString();

/** A body is a serialised rich text document — the same string the API stores. */
const plain = ( text: string ) =>
    JSON.stringify( { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } );

/** One formatted body, so the thread is seen rendering marks and a list. */
const FORMATTED_BODY = JSON.stringify( {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'Held current rates to ' },
                { type: 'text', marks: [{ type: 'bold' }], text: 'end of Q3' },
                { type: 'text', text: ', on two conditions:' },
            ],
        },
        {
            type: 'bulletList',
            content: [
                {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Monthly volume commitment' }] }],
                },
                {
                    type: 'listItem',
                    content: [{
                        type: 'paragraph',
                        content: [
                            { type: 'text', text: 'Shipping surcharge reviewed — see the ' },
                            {
                                type: 'text',
                                marks: [{ type: 'link', attrs: { href: 'https://example.com/quote-10482' } }],
                                text: 'original quote',
                            },
                        ],
                    }],
                },
            ],
        },
    ],
} );

const SEEDED: CommentEntry[] = [
    {
        id: 'c2',
        authorName: 'Tom Keller',
        createdAt: hoursAgo( 24 ),
        body: plain( 'Agreed — flagging it with Provence Aromatics this week.' ),
    },
    {
        id: 'c1',
        authorName: 'Maya Ronson',
        createdAt: hoursAgo( 48 ),
        body: plain( 'Running low after the next lavender batch — worth bumping the reorder point?' ),
    },
    { id: 'c3', authorName: 'Brady Leach', createdAt: hoursAgo( 3 ), body: FORMATTED_BODY },
    { id: 'c4', authorName: 'Priya N', createdAt: hoursAgo( 0.2 ), body: plain( 'Quote attached to PO-10482.' ) },
    // Emoji check: multi-byte and ZWJ sequences must render, not mojibake, and
    // must not break the initials fallback or the line height.
    {
        id: 'c5',
        authorName: 'Renée Söderberg 🌿',
        createdAt: hoursAgo( 1 ),
        body: plain(
            'Samples arrived 📦 and they smell great 🌸✨ — packaging was a bit crushed ⚠️ but contents fine. '
            + 'Signing off 👍🏽 and looping in the team 👩‍🔬👨‍🌾 for the batch trial. 🇦🇺'
        ),
    },
    // A body written before the editor existed. It cannot be read, and says so
    // rather than taking the thread down with it.
    { id: 'c6', authorName: 'Legacy Import', createdAt: hoursAgo( 72 ), body: 'Plain text from an older row.' },
];

const MANY: CommentEntry[] = Array.from( { length: 12 }, ( _, index ) => ( {
    id: `m-${index + 1}`,
    authorName: ['Maya Ronson', 'Tom Keller', 'Brady Leach'][index % 3],
    createdAt: hoursAgo( index * 6 + 1 ),
    body: plain( `Comment ${index + 1} — routine follow-up on the outstanding order.` ),
} ) );

// ─── Playground ───────────────────────────────────────────────────────────────

function ThreadDemo( {
    seed,
    label,
    width,
    compact,
    pageSize,
}: {
    seed: CommentEntry[];
    label: string;
    width?: number;
    compact?: boolean;
    pageSize?: number;
} )
{
    const [comments, setComments] = useState<CommentEntry[]>( seed );
    const [isSubmitting, setSubmitting] = useState( false );

    const add = async ( body: string ) =>
    {
        setSubmitting( true );
        // Stand-in for the mutation, so the disabled state is visible.
        await new Promise( resolve => setTimeout( resolve, 400 ) );
        setComments( previous => [
            ...previous,
            { id: `new-${previous.length + 1}`, authorName: 'Brady Leach', createdAt: new Date().toISOString(), body },
        ] );
        setSubmitting( false );
    };

    return (
        <Box sx={{ maxWidth: width, border: '1px solid', borderColor: 'border.base', borderRadius: 1, p: 2.5 }}>
            <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}
            >
                {label}
            </Typography>
            <CommentThread
                comments={comments}
                onSubmit={add}
                isSubmitting={isSubmitting}
                compact={compact}
                pageSize={pageSize}
            />

            <PlaygroundDataPreview
                title="CommentEntry[]"
                caption="Input order as supplied — the thread sorts newest-first itself."
                data={comments}
            />
        </Box>
    );
}

export function CommentThreadPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>CommentThread</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Entity-agnostic. Takes <code>CommentEntry[]</code> and an <code>onSubmit</code>;
                orders newest-first itself and pages the list so a busy record cannot make the
                page around it longer. Bodies are stored rich text documents: Enter continues a
                list, and sending is the button or Ctrl/Cmd+Enter.
            </Typography>

            <Stack spacing={4}>
                <ThreadDemo seed={SEEDED} label="Typical — mixed lengths, unordered input" />
                <Divider />
                <ThreadDemo
                    seed={SEEDED}
                    label="Compact — as in a profile section: composer folded, 3 per page"
                    compact
                    pageSize={3}
                />
                <Divider />
                <ThreadDemo seed={[]} label="Empty" />
                <Divider />
                <ThreadDemo seed={MANY} label="Paged — 12 comments, 5 per page" />
                <Divider />
                <ThreadDemo seed={SEEDED} label="Narrow — as in the detail panel" width={420} />
            </Stack>
        </Box>
    );
}

export default CommentThreadPlayground;
