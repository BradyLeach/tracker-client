import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormConfigFooter } from '@/components/forms/footer/FormConfigFooter';
import type { FormConfig } from '@/components/forms/types/formConfig.types';

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key // Return key as-is for testing
    })
}));

// Mock SmartLink to avoid router dependencies
vi.mock('@/components/shared/links/SmartLink', () => ({
    SmartLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    )
}));

describe('FormConfigFooter', () =>
{
    it('renders footer link when footerLink is provided', () =>
    {
        const config: FormConfig = {
            groups: [],
            footerLink: {
                prefaceText: 'pages.login.needAccount',
                linkText: 'shared.buttons.register',
                href: '/auth/register'
            }
        };

        render(<FormConfigFooter config={config} />);

        expect(screen.getByText('pages.login.needAccount')).toBeInTheDocument();
        expect(screen.getByText('shared.buttons.register')).toBeInTheDocument();
    });

    it('renders nothing when footerLink is not provided', () =>
    {
        const config: FormConfig = {
            groups: []
        };

        const { container } = render(<FormConfigFooter config={config} />);

        expect(container.firstChild).toBeNull();
    });

    it('renders link with correct href', () =>
    {
        const config: FormConfig = {
            groups: [],
            footerLink: {
                prefaceText: 'Already have an account?',
                linkText: 'Sign In',
                href: '/auth/login'
            }
        };

        render(<FormConfigFooter config={config} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/auth/login');
    });

    it('renders both preface text and link text', () =>
    {
        const config: FormConfig = {
            groups: [],
            footerLink: {
                prefaceText: "Don't have an account?",
                linkText: 'Register',
                href: '/auth/register'
            }
        };

        render(<FormConfigFooter config={config} />);

        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('handles internal routes', () =>
    {
        const config: FormConfig = {
            groups: [],
            footerLink: {
                prefaceText: 'Forgot password?',
                linkText: 'Reset it here',
                href: '/auth/forgot-password'
            }
        };

        render(<FormConfigFooter config={config} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/auth/forgot-password');
    });

    it('handles external URLs', () =>
    {
        const config: FormConfig = {
            groups: [],
            footerLink: {
                prefaceText: 'Need help?',
                linkText: 'Contact support',
                href: 'https://support.example.com'
            }
        };

        render(<FormConfigFooter config={config} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://support.example.com');
    });
});
