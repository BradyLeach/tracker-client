import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrationService } from '@/domains/authentication/services/registration.service';
import { dataService } from '@/services/dataService/dataService';
import type {
    RegistrationFormFields,
    ProvideCodeFormFields,
    ProvideEmailFormFields
} from '@/domains/authentication/types/formFields.types';

vi.mock('@/services/dataService/dataService');

describe('registrationService', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    describe('register', () =>
    {
        it('returns data on successful registration', async () =>
        {
            const mockResponse = {
                data: { email: 'newuser@example.com', id: '123' },
                error: undefined,
                status: 201
            };

            vi.mocked(dataService.create).mockResolvedValue(mockResponse);

            const fields: RegistrationFormFields = {
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                firstname: 'John',
                lastname: 'Doe',
                companyName: 'Acme Ltd',
                countryId: 'country-au',
                acknowledgedTerms: true
            };

            const result = await registrationService.register(fields);

            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(201);
        });

        it('returns error when email already exists', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'resource.exists',
                    details: { field: 'email' }
                },
                status: 400
            };

            vi.mocked(dataService.create).mockResolvedValue(mockResponse);

            const fields: RegistrationFormFields = {
                email: 'existing@example.com',
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                firstname: 'John',
                lastname: 'Doe',
                companyName: 'Acme Ltd',
                countryId: 'country-au',
                acknowledgedTerms: true
            };

            const result = await registrationService.register(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });

        it('returns error on validation failure', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'resource.invalid',
                    details: { field: 'password' }
                },
                status: 400
            };

            vi.mocked(dataService.create).mockResolvedValue(mockResponse);

            const fields: RegistrationFormFields = {
                email: 'user@example.com',
                password: 'weak',
                passwordConfirm: 'weak',
                firstname: 'John',
                lastname: 'Doe',
                companyName: 'Acme Ltd',
                countryId: 'country-au',
                acknowledgedTerms: true
            };

            const result = await registrationService.register(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });
    });

    describe('verify', () =>
    {
        it('returns success on valid verification code', async () =>
        {
            const mockResponse = {
                data: { verified: true },
                error: undefined,
                status: 200
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideCodeFormFields = {
                email: 'user@example.com',
                code: '123456'
            };

            const result = await registrationService.verify(fields);

            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('returns error on invalid verification code', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'verification.invalid',
                    details: { field: 'code' }
                },
                status: 400
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideCodeFormFields = {
                email: 'user@example.com',
                code: '999999'
            };

            const result = await registrationService.verify(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });

        it('returns error on expired verification code', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'verification.expired',
                    details: { field: 'code' }
                },
                status: 400
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideCodeFormFields = {
                email: 'user@example.com',
                code: '123456'
            };

            const result = await registrationService.verify(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });
    });

    describe('requestNewCode', () =>
    {
        it('returns success when new code is sent', async () =>
        {
            const mockResponse = {
                data: { sent: true },
                error: undefined,
                status: 200
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideEmailFormFields = {
                email: 'user@example.com'
            };

            const result = await registrationService.requestNewCode(fields);

            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('returns error when email not found', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'resource.noexist',
                    details: { field: 'email' }
                },
                status: 404
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideEmailFormFields = {
                email: 'nonexistent@example.com'
            };

            const result = await registrationService.requestNewCode(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });

        it('returns error when rate limited', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'permission.tooManyRequests',
                    details: {}
                },
                status: 429
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: ProvideEmailFormFields = {
                email: 'user@example.com'
            };

            const result = await registrationService.requestNewCode(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });
    });

    describe('checkHandle', () =>
    {
        it('returns 204 when handle is available', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: undefined,
                status: 204
            };

            vi.mocked(dataService.getOne).mockResolvedValue(mockResponse);

            const result = await registrationService.checkHandle('availablehandle');

            expect(result.status).toBe(204);
            expect(result.error).toBeUndefined();
        });

        it('returns error when handle is taken', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'resource.exists',
                    details: { field: 'handle' }
                },
                status: 400
            };

            vi.mocked(dataService.getOne).mockResolvedValue(mockResponse);

            const result = await registrationService.checkHandle('takenhandle');

            expect(result.error).toBeDefined();
        });
    });

    describe('checkEmail', () =>
    {
        it('returns 204 when email is available', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: undefined,
                status: 204
            };

            vi.mocked(dataService.getOne).mockResolvedValue(mockResponse);

            const result = await registrationService.checkEmail('available@example.com');

            expect(result.status).toBe(204);
            expect(result.error).toBeUndefined();
        });

        it('returns error when email is taken', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'resource.exists',
                    details: { field: 'email' }
                },
                status: 400
            };

            vi.mocked(dataService.getOne).mockResolvedValue(mockResponse);

            const result = await registrationService.checkEmail('taken@example.com');

            expect(result.error).toBeDefined();
        });
    });
});
