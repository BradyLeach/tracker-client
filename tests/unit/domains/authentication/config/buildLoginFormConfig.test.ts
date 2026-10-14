import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildLoginFormConfig } from '@/domains/authentication/config/buildLoginFormConfig';
import type { FieldGroupConfig } from '@/components/forms/types/formConfig.types';
import { object, string } from 'yup';
import '@/core/validation/yup/yupExtensions'; // Load custom Yup extensions

// Mock dependencies
vi.mock('@/components/forms/utils/FormFieldFactory', () => ({
    formFieldFactory: {
        getFormFields: vi.fn(() => [
            { name: 'email', type: 'email', required: true },
            { name: 'password', type: 'password', required: true }
        ])
    }
}));

vi.mock('@/core/models/ModelRegistry', () => ({
    modelRegistry: {
        getValidation: vi.fn(() =>
            object({
                email: string().email().required(),
                password: string().required()
            })
        )
    }
}));

describe('buildLoginFormConfig', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    it('returns a cached config on subsequent calls', () =>
    {
        const config1 = buildLoginFormConfig();
        const config2 = buildLoginFormConfig();

        expect(config1).toBe(config2); // Same reference
    });

    it('returns config with email and password fields', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.groups).toHaveLength(1);
        const group = config.groups[0] as FieldGroupConfig;
        expect(group.fields).toHaveLength(2);

        const fieldNames = group.fields.map(f => f.name);
        expect(fieldNames).toContain('email');
        expect(fieldNames).toContain('password');
    });

    it('includes validation schema', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.validationSchema).toBeDefined();
    });

    it('includes context for rule checks', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.context).toMatchObject({
            isCreate: true,
            service: 'identity',
            operation: 'create',
            regionCode: 'global'
        });
    });

    it('includes footerLink configuration', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.footerLink).toBeDefined();
        expect(config.footerLink).toMatchObject({
            prefaceText: expect.any(String),
            linkText: expect.any(String),
            href: '/auth/register'
        });
    });

    it('has no group title for simple single-page form', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.groups[0].title).toBe('');
    });

    it('footer link points to registration page', () =>
    {
        const config = buildLoginFormConfig();

        expect(config.footerLink?.href).toBe('/auth/register');
    });
});
