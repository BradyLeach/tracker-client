import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import type { FormConfig } from '@/components/forms/types/formConfig.types';
import { object, string } from 'yup';

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('BaseFormRenderer (integration)', () =>
{
    it('renders form fields from config', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true },
                        { name: 'password', type: 'password', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formScope="login"
            />
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders group title when provided', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    title: 'forms.login.groupTitle',
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formScope="login"
            />
        );

        expect(screen.getByText('forms.login.groupTitle')).toBeInTheDocument();
    });

    it('renders group subtitle when provided', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    title: 'Group Title',
                    subtitle: 'forms.login.groupSubtitle',
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formScope="login"
            />
        );

        expect(screen.getByText('forms.login.groupSubtitle')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when submitted', async () =>
    {
        const user = userEvent.setup();
        const config: FormConfig = {
            groups: [
                {
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true },
                        { name: 'password', type: 'password', required: true }
                    ]
                }
            ],
            validationSchema: object({
                email: string().email().required(),
                password: string().required()
            })
        };

        const onSubmit = vi.fn();

        const { container } = render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formId="test-form"
                formScope="login"
            />
        );

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'SecurePass123!');

        // Find form by ID and submit
        const form = container.querySelector('#test-form') as HTMLFormElement;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await waitFor(() =>
        {
            expect(onSubmit).toHaveBeenCalled();
        });

        const submittedData = onSubmit.mock.calls[0][0];
        expect(submittedData).toMatchObject({
            email: 'test@example.com',
            password: 'SecurePass123!'
        });
    });

    it('passes loading prop to field renderer', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true },
                        { name: 'password', type: 'password', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                loading={true}
                formScope="login"
            />
        );

        // Test that loading state doesn't break rendering
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders multiple groups in order', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    title: 'Group 1',
                    type: 'fields',
                    fields: [
                        { name: 'field1', type: 'text', required: true }
                    ]
                },
                {
                    title: 'Group 2',
                    type: 'fields',
                    fields: [
                        { name: 'field2', type: 'text', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formScope="test"
            />
        );

        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 2')).toBeInTheDocument();
        expect(screen.getByLabelText(/field1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/field2/i)).toBeInTheDocument();
    });

    it('uses custom formId when provided', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        const { container } = render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formId="custom-form-id"
                formScope="login"
            />
        );

        const form = container.querySelector('#custom-form-id');
        expect(form).toBeInTheDocument();
        expect(form?.tagName.toLowerCase()).toBe('form');
    });

    it('uses default formId when not provided', () =>
    {
        const config: FormConfig = {
            groups: [
                {
                    type: 'fields',
                    fields: [
                        { name: 'email', type: 'email', required: true }
                    ]
                }
            ]
        };

        const onSubmit = vi.fn();

        const { container } = render(
            <BaseFormRenderer
                config={config}
                onSubmit={onSubmit}
                formScope="login"
            />
        );

        const form = container.querySelector('#base-form');
        expect(form).toBeInTheDocument();
        expect(form?.tagName.toLowerCase()).toBe('form');
    });
});
