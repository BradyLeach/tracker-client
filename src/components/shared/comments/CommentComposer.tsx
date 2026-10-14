/**
 * CommentComposer
 *
 * The add-a-comment row. Owns only the draft document; submitting is the
 * caller's, so the same composer works against an optimistic cache or a plain
 * mutation.
 *
 * The draft is a serialised rich text document, not a line of text. Enter
 * belongs to the document — it continues a list — so sending is the button or
 * Ctrl/Cmd+Enter.
 *
 * No avatar: the author is the person typing, so the face tells them nothing and
 * costs the editor the width. Avatars stay on the comments, where they identify
 * someone other than the reader.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@/components/ui';
import { RichTextEditor, type RichTextChange } from '@/components/shared/richText';
import { getConfig } from '@/config';

export interface CommentComposerProps
{
    /** Resolves when the comment is stored; the draft clears only on success. */
    onSubmit: ( body: string ) => void | Promise<void>;
    isSubmitting?: boolean;
    placeholder?: string;
    /**
     * For a composer sharing a bounded section with the thread it posts to: one
     * line until it is used, and no Send until there is something to send.
     */
    compact?: boolean;
}

const EMPTY_DRAFT: RichTextChange = { value: '', characterCount: 0, isEmpty: true };

export function CommentComposer( {
    onSubmit,
    isSubmitting = false,
    placeholder,
    compact = false,
}: CommentComposerProps )
{
    const { t } = useTranslation();
    const [draft, setDraft] = useState<RichTextChange>( EMPTY_DRAFT );

    const maxCharacters = getConfig().validation.comment.maxCharacters;
    const canSend = !draft.isEmpty && draft.characterCount <= maxCharacters && !isSubmitting;

    const submit = async () =>
    {
        if( !canSend ) return;

        await onSubmit( draft.value );
        // Cleared after the caller resolves, so a failed send keeps the draft.
        setDraft( EMPTY_DRAFT );
    };

    return (
        // minWidth:0 so the editor shrinks with the column rather than pushing
        // the thread wider.
        <Box sx={{ minWidth: 0 }}>
            <RichTextEditor
                value={draft.value}
                onChange={setDraft}
                placeholder={placeholder ?? t( 'comment.placeholder' )}
                maxCharacters={maxCharacters}
                compact={compact}
                disabled={isSubmitting}
                // The editor grows with what is typed, so the resting height
                // only has to fit the first line.
                minHeight={compact ? 24 : 56}
                onSubmit={() => void submit()}
            />

            {/* Compact keeps the row out of the layout until there is something
                to send; Ctrl/Cmd+Enter works either way. */}
            {( !compact || !draft.isEmpty ) && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        size="small"
                        variant="contained"
                        disabled={!canSend}
                        onClick={() => void submit()}
                    >
                        {t( 'comment.send' )}
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default CommentComposer;
