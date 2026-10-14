/**
 * CustomTransitionDialog
 *
 * Reusable dialog wrapper from Modernize template.
 * Provides consistent theming and structure for all dialogs in the app.
 *
 * Based on Material-UI Dialog with Modernize styling.
 * Supports smooth slide-up transitions for enhanced UX.
 */
import { forwardRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slide,
    type DialogProps,
    type SlideProps,
} from '@mui/material';

/**
 * Slide transition component (from Modernize TransitionDialog reference)
 */
const Transition = forwardRef( function Transition(
    props: SlideProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) 
{
    return <Slide direction="up" ref={ref} {...props} />;
} );

/**
 * Props for CustomTransitionDialog component
 */
export interface CustomTransitionDialogProps extends Omit<DialogProps, 'open' | 'onClose' | 'title'> {
    /**
     * Whether the dialog is open
     */
    open: boolean;

    /**
     * Callback when dialog should close
     */
    onClose: () => void;

    /**
     * Dialog title (optional)
     */
    title?: React.ReactNode;

    /**
     * Dialog content
     */
    children: React.ReactNode;

    /**
     * Dialog actions (buttons, typically) (optional)
     */
    actions?: React.ReactNode;

    /**
     * Maximum width of dialog
     * @default 'sm'
     */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

    /**
     * Whether dialog should take full width
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Whether to use slide transition animation
     * @default true
     */
    transition?: boolean;
}

/**
 * CustomTransitionDialog
 *
 * Wrapper around Material-UI Dialog with consistent theming.
 * Use this instead of raw Dialog to maintain design system consistency.
 *
 * @param props - Component props
 * @returns Rendered dialog with transition
 *
 * @example
 * <CustomTransitionDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Upgrade Your Plan"
 *   maxWidth="md"
 *   fullWidth
 *   actions={
 *     <>
 *       <Button onClick={handleClose}>Cancel</Button>
 *       <Button variant="contained" onClick={handleUpgrade}>Upgrade</Button>
 *     </>
 *   }
 * >
 *   <Typography>Your content here...</Typography>
 * </CustomTransitionDialog>
 */
export function CustomTransitionDialog( {
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = false,
    transition = true,
    ...dialogProps
}: CustomTransitionDialogProps )
{
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            TransitionComponent={transition ? Transition : undefined}
            keepMounted={transition}
            {...dialogProps}
        >
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>{children}</DialogContent>
            {actions && <DialogActions>{actions}</DialogActions>}
        </Dialog>
    );
}

export default CustomTransitionDialog;
