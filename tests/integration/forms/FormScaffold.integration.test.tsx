import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';

describe('FormScaffold (integration)', () => {
    it('renders the Body slot content', () => {
        render(
            <FormScaffold>
                <FormScaffold.Body>
                    <div>Body content</div>
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders Header title and subtitle', () => {
        render(
            <FormScaffold>
                <FormScaffold.Header title="Header Title" subtitle="Subtitle here" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByText('Header Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle here')).toBeInTheDocument();
    });

    it('renders Feedback with severity and role=alert', () => {
        render(
            <FormScaffold>
                <FormScaffold.Feedback message="Feedback message" severity="error" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Feedback message');
    });

    it('does not render Feedback if message is falsy', () => {
        const { container } = render(
            <FormScaffold>
                <FormScaffold.Feedback message={undefined} severity="warning" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(container).not.toContainHTML('role="alert"');
    });

    it('renders Message content when present', () => {
        render(
            <FormScaffold>
                <FormScaffold.Message>
                    <div>Upgrade your plan</div>
                </FormScaffold.Message>
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByText('Upgrade your plan')).toBeInTheDocument();
    });

    it('renders Actions content', () => {
        render(
            <FormScaffold>
                <FormScaffold.Actions>
                    <button>Submit</button>
                </FormScaffold.Actions>
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('renders Footer content', () => {
        render(
            <FormScaffold>
                <FormScaffold.Footer>
                    <div>Footer text</div>
                </FormScaffold.Footer>
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByText('Footer text')).toBeInTheDocument();
    });

    it('renders Feedback and Message simultaneously', () => {
        render(
            <FormScaffold>
                <FormScaffold.Feedback message="Form error" severity="error" />
                <FormScaffold.Message>
                    <div>Black Friday Sale</div>
                </FormScaffold.Message>
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByText('Form error')).toBeInTheDocument();
        expect(screen.getByText('Black Friday Sale')).toBeInTheDocument();
    });

    it('renders slots in correct order regardless of JSX order', () => {
        const { container } = render(
            <FormScaffold>
                <FormScaffold.Footer>
                    <div>Footer</div>
                </FormScaffold.Footer>
                <FormScaffold.Header title="Header" />
                <FormScaffold.Actions>
                    <button>Action</button>
                </FormScaffold.Actions>
                <FormScaffold.Body>
                    <div>Body</div>
                </FormScaffold.Body>
                <FormScaffold.Feedback message="Feedback" severity="info" />
            </FormScaffold>
        );
        const textContent = container.textContent;
        const headerPos = textContent?.indexOf('Header') ?? -1;
        const feedbackPos = textContent?.indexOf('Feedback') ?? -1;
        const bodyPos = textContent?.indexOf('Body') ?? -1;
        const actionPos = textContent?.indexOf('Action') ?? -1;
        const footerPos = textContent?.indexOf('Footer') ?? -1;

        expect(headerPos).toBeLessThan(feedbackPos);
        expect(feedbackPos).toBeLessThan(bodyPos);
        expect(bodyPos).toBeLessThan(actionPos);
        expect(actionPos).toBeLessThan(footerPos);
    });

    it('renders Header with only actions and no title', () => {
        render(
            <FormScaffold>
                <FormScaffold.Header actions={<button>Help</button>} />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    });

    it('renders Feedback with warning severity', () => {
        render(
            <FormScaffold>
                <FormScaffold.Feedback message="Warning message" severity="warning" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByRole('alert')).toHaveTextContent('Warning message');
    });

    it('renders Feedback with info severity', () => {
        render(
            <FormScaffold>
                <FormScaffold.Feedback message="Info message" severity="info" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByRole('alert')).toHaveTextContent('Info message');
    });

    it('renders Feedback with success severity', () => {
        render(
            <FormScaffold>
                <FormScaffold.Feedback message="Success message" severity="success" />
                <FormScaffold.Body>
                    <div />
                </FormScaffold.Body>
            </FormScaffold>
        );
        expect(screen.getByRole('alert')).toHaveTextContent('Success message');
    });
});
