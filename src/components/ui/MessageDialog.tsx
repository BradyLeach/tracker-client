import { CustomTransitionDialog } from '@/theme/theme-elements/surfaces/CustomTransitionDialog';

/**
 * MessageDialogProps
 *
 * Props for the MessageDialog component.
 * Provides a consistent modal dialog for messages, confirmations, and upsell prompts.
 */
export interface MessageDialogProps
{
    /**
     * Whether the dialog is open
     */
    open: boolean;

    /**
     * Callback triggered when the dialog should close
     */
    onClose: () => void;

    /**
     * Optional dialog title
     */
    title?: React.ReactNode;

    /**
     * Dialog content (can be plain text, markup, or a component tree)
     */
    children: React.ReactNode;

    /**
     * Action buttons to display in the dialog footer
     * Accepts full React nodes for layout flexibility (e.g., custom buttons, fragments, stacks)
     */
    actions?: React.ReactNode;

    /**
     * Maximum width of the dialog
     * @default 'sm'
     */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

    /**
     * Whether the dialog should take full width
     * @default true
     */
    fullWidth?: boolean;

    /**
     * Whether to enable slide transition animation
     * @default true
     */
    transition?: boolean;
}

/**
 * MessageDialog
 *
 * A reusable dialog component based on CustomTransitionDialog.
 * Intended for generic message/confirmation dialogs with configurable title, content, and action buttons.
 * Use this instead of raw Dialog to maintain consistent theming and behavior across the app.
 *
 * @param props - Component props
 * @returns Rendered dialog component
 *
 * @example
 * <MessageDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   actions={
 *     <>
 *       <Button onClick={handleClose}>Cancel</Button>
 *       <Button onClick={handleConfirm} variant="contained" color="primary">Confirm</Button>
 *     </>
 *   }
 * >
 *   <Typography>Are you sure you want to proceed?</Typography>
 * </MessageDialog>
 */
export function MessageDialog( {
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    transition = true,
}: MessageDialogProps )
{
    return (
        <CustomTransitionDialog
            open={open}
            onClose={onClose}
            title={title}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            transition={transition}
            actions={actions}
        >
            {children}
        </CustomTransitionDialog>
    );
}
