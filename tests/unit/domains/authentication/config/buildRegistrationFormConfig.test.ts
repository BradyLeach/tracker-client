import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildRegistrationFormConfig } from '@/domains/authentication/config/buildRegistrationFormConfig';
import type { FieldGroupConfig } from '@/components/forms/types/formConfig.types';
import { object, string, boolean } from 'yup';
import '@/core/validation/yup/yupExtensions'; // Load custom Yup extensions

// Mock dependencies
vi.mock('@/components/forms/utils/FormFieldFactory', () => ({
    formFieldFactory: {
        getFormFields: vi.fn((model: string) =>
        {
            if (model === 'identity')
            {
                return [
                    { name: 'firstname', type: 'text', required: true },
                    { name: 'lastname', type: 'text', required: true },
                    { name: 'dob', type: 'date', required: true },
                    { name: 'email', type: 'email', required: true },
                    { name: 'password', type: 'password', required: true }
                ];
            }
            if (model === 'profile')
            {
                return [
                    { name: 'handle', type: 'text', required: true },
                    { name: 'name', type: 'text', required: true }
                ];
            }
            return [];
        })
    }
}));

vi.mock('@/core/models/ModelRegistry', () => ({
    modelRegistry: {
        getValidation: vi.fn((model: string) =>
        {
            if (model === 'identity')
            {
                return object({
                    email: string().email().required(),
                    password: string().required(),
                    firstname: string().required(),
                    lastname: string().required(),
                    dob: string().required()
                });
            }
            if (model === 'profile')
            {
                return object({
                    handle: string().required(),
                    name: string().required()
                });
            }
            return object({});
        })
    }
}));

vi.mock('@/domains/authentication/services/registration.service', () => ({
    registrationService: {
        checkEmail: vi.fn(),
        checkHandle: vi.fn()
    }
}));

/** The country catalog the form is built against, as the public endpoint returns it. */
const COUNTRY_OPTIONS = [
    { value: 'country-au', label: 'Australia' },
    { value: 'country-ca', label: 'Canada' }
];

describe('buildRegistrationFormConfig', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    it('offers the countries it was given as the jurisdiction options', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fields = (config.groups[0] as FieldGroupConfig).fields;
        const country = fields.find(field => field.name === 'countryId');

        expect(country?.options).toEqual(COUNTRY_OPTIONS);
        expect(country?.type).toBe('autocomplete');
    });

    it('constrains the country to the catalog rather than accepting typed text', () =>
    {
        // A jurisdiction the backend cannot resolve to a country record is not one an
        // account can be bound to, so this field does not behave like companyName.
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fields = (config.groups[0] as FieldGroupConfig).fields;

        expect(fields.find(field => field.name === 'countryId')?.freeSolo).toBe(false);
    });

    it('pre-selects the suggested country when one is supplied', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS, { countryId: 'country-au' });

        const fields = (config.groups[0] as FieldGroupConfig).fields;

        expect(fields.find(field => field.name === 'countryId')?.defaultValue).toBe('country-au');
    });

    it('leaves the country empty when nothing is suggested', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fields = (config.groups[0] as FieldGroupConfig).fields;

        expect(fields.find(field => field.name === 'countryId')?.defaultValue).toBeUndefined();
    });

    it('renders as a single page rather than a wizard', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.groups).toHaveLength(1);
    });

    it('collects everything registration needs in that one group', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fieldNames = (config.groups[0] as FieldGroupConfig).fields.map(f => f.name);

        expect(fieldNames).toContain('firstname');
        expect(fieldNames).toContain('lastname');
        expect(fieldNames).toContain('companyName');
        expect(fieldNames).toContain('email');
        expect(fieldNames).toContain('password');
        expect(fieldNames).toContain('passwordConfirm');
        expect(fieldNames).toContain('countryId');
        expect(fieldNames).toContain('acknowledgedTerms');
    });

    it('does not collect handle — the backend generates it', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fieldNames = (config.groups[0] as FieldGroupConfig).fields.map(f => f.name);

        expect(fieldNames).not.toContain('handle');
    });

    it('marks fields with no backend model of their own as virtual', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fields = (config.groups[0] as FieldGroupConfig).fields;
        const virtualNames = ['passwordConfirm', 'companyName', 'countryId', 'acknowledgedTerms'];

        for (const name of virtualNames)
        {
            expect(fields.find(f => f.name === name)?.virtual).toBe(true);
        }
    });

    it('enriches acknowledgedTerms field with link configuration', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        const fields = (config.groups[0] as FieldGroupConfig).fields;
        const acknowledgedTerms = fields.find(f => f.name === 'acknowledgedTerms');

        expect(acknowledgedTerms?.label).toBeDefined();
        expect(acknowledgedTerms?.label).toMatchObject({
            text: expect.any(String),
            link: expect.any(String),
            href: '/terms'
        });
    });

    it('includes validation schema', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.validationSchema).toBeDefined();
    });

    it('includes context for rule checks', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.context).toMatchObject({
            isCreate: true,
            service: 'identity',
            operation: 'create',
            regionCode: 'global'
        });
    });

    it('includes footerLink configuration', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.footerLink).toBeDefined();
        expect(config.footerLink).toMatchObject({
            prefaceText: expect.any(String),
            linkText: expect.any(String),
            href: '/auth/login'
        });
    });

    it('footer link points to login page', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.footerLink?.href).toBe('/auth/login');
    });

    it('includes title and subtitle', () =>
    {
        const config = buildRegistrationFormConfig(COUNTRY_OPTIONS);

        expect(config.title).toBeDefined();
        expect(config.subtitle).toBeDefined();
    });
});
