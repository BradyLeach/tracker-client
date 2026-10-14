/**
 * Rich Text Service - Public API
 *
 * What the application uses. The implementation is swappable: change the two
 * bindings below to move off Tiptap without touching a single call site.
 *
 * Unlike the map service, which exports a render function, these are exported
 * as components. The editor holds state and hooks, so it must be rendered as
 * JSX rather than called.
 */

import type { FC } from 'react';
import { TiptapRichTextContent, TiptapRichTextEditor } from './richText.tiptap';
import type { RichTextContentProps, RichTextEditorProps } from './richText.types';

/** Active editor implementation. */
export const RichTextEditorImpl: FC<RichTextEditorProps> = TiptapRichTextEditor;

/** Active read-only renderer. */
export const RichTextContentImpl: FC<RichTextContentProps> = TiptapRichTextContent;

export type {
    RichTextChange,
    RichTextLabels,
    RichTextEditorProps,
    RichTextContentProps
} from './richText.types';
