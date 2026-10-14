import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { dataService } from '@/services/dataService/dataService';
import type { LoginFormFields } from '@/domains/authentication/types/formFields.types';

vi.mock('@/services/dataService/dataService');

describe('authenticationService', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    describe('login', () =>
    {
        it('returns data on successful login', async () =>
        {
            const mockResponse = {
                data: { email: 'user@example.com', token: 'abc123' },
                error: undefined,
                status: 200
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: LoginFormFields = {
                email: 'user@example.com',
                password: 'SecurePass123!'
            };

            const result = await authenticationService.login(fields);

            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(200);
        });

        it('returns error on failed login', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'auth.invalid',
                    details: { field: 'email' }
                },
                status: 401
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: LoginFormFields = {
                email: 'wrong@example.com',
                password: 'WrongPass'
            };

            const result = await authenticationService.login(fields);

            expect(result.data).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.status).toBe(401);
        });

        it('handles network errors gracefully', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'network.error',
                    details: {}
                },
                status: 500
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const fields: LoginFormFields = {
                email: 'user@example.com',
                password: 'SecurePass123!'
            };

            const result = await authenticationService.login(fields);

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });
    });

    describe('logout', () =>
    {
        it('returns success on logout', async () =>
        {
            const mockResponse = {
                data: { success: true },
                error: undefined,
                status: 200
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const result = await authenticationService.logout();

            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('handles logout errors', async () =>
        {
            const mockResponse = {
                data: undefined,
                error: {
                    key: 'auth.logoutFailed',
                    details: {}
                },
                status: 500
            };

            vi.mocked(dataService.post).mockResolvedValue(mockResponse);

            const result = await authenticationService.logout();

            expect(result.error).toBeDefined();
            expect(result.data).toBeUndefined();
        });
    });
});
