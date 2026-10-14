/**
 * ModelRegistry Unit Tests
 *
 * Tests the model definition management with minimal mocking.
 * Only mocks the fetchDefinitions boundary, letting real caching and validation logic run.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { modelService } from '@/core/models/model.service';
import { makeModelDefinition, makeFieldDefinition, makeUserModelDefinition } from '@/test-factories/models';

// Mock i18next — must provide chainable use/init for @/utils/i18n side-effect
vi.mock('i18next', () =>
{
    const instance: Record<string, unknown> = {
        t: (key: string) =>
        {
            if (key === 'messages.resource.empty') return 'Resource empty';
            if (key === 'messages.error.server') return 'Server error';
            if (key === 'messages.error.unknown') return 'Unknown error';
            return key;
        },
        isInitialized: true,
        init: () => instance,
    };
    instance.use = () => instance;
    return { default: instance };
});

// Mock only the external API boundary
vi.mock('@/core/models/model.service', () => ({
    modelService: {
        getModelDefinitions: vi.fn()
    }
}));

const mockGetModelDefinitions = vi.mocked(modelService.getModelDefinitions);

describe('ModelRegistry', () =>
{
    beforeEach(() =>
    {
        // Clear any existing definitions for clean tests
        (modelRegistry as any).definitions = {};
        vi.resetAllMocks();
    });

    describe('Definition Loading', () =>
    {
        it('should load model definitions from modelService', async () =>
        {
            const mockDefinitions = {
                user: makeUserModelDefinition(),
                product: makeModelDefinition('product', {
                    name: makeFieldDefinition('string', { requiredOnCreate: true }),
                    price: makeFieldDefinition('number', { validation: { min: 0 } })
                })
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: mockDefinitions,
                status: 200
            });

            await modelRegistry.load();

            expect(modelRegistry.get('user')).toEqual(mockDefinitions.user);
            expect(modelRegistry.get('product')).toEqual(mockDefinitions.product);
        });

        it('should throw error when response is 204 (no content)', async () =>
        {
            mockGetModelDefinitions.mockResolvedValueOnce({
                status: 204
            });

            await expect(modelRegistry.load()).rejects.toThrow('Resource empty');
        });

        it('should throw error when API returns error', async () =>
        {
            mockGetModelDefinitions.mockResolvedValueOnce({
                error: {
                    key: 'error.server'
                },
                status: 500
            });

            await expect(modelRegistry.load()).rejects.toThrow();
        });

        it('should throw error when service throws exception', async () =>
        {
            mockGetModelDefinitions.mockRejectedValueOnce(new Error('Network error'));

            await expect(modelRegistry.load()).rejects.toThrow('Network error');
        });
    });

    describe('Model Retrieval', () =>
    {
        beforeEach(async () =>
        {
            const definitions = {
                user: makeUserModelDefinition(),
                product: makeModelDefinition('product')
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();
        });

        it('should return model definition when it exists', () =>
        {
            const user = modelRegistry.get('user');

            expect(user).toBeDefined();
            expect(user?.name).toBe('user');
            expect(user?.schema).toBeDefined();
        });

        it('should return undefined for non-existent models', () =>
        {
            expect(modelRegistry.get('nonexistent')).toBeUndefined();
        });

        it('should check model existence correctly', () =>
        {
            expect(modelRegistry.has('user')).toBe(true);
            expect(modelRegistry.has('product')).toBe(true);
            expect(modelRegistry.has('nonexistent')).toBe(false);
        });
    });

    describe('Lazy Validation Schema Creation', () =>
    {
        beforeEach(async () =>
        {
            const definitions = {
                user: makeModelDefinition('user', {
                    email: makeFieldDefinition('string', {
                        format: 'email',
                        requiredOnCreate: true
                    }),
                    age: makeFieldDefinition('number', {
                        validation: { min: 0, max: 150 }
                    }),
                    role: makeFieldDefinition('enum', {
                        validation: { oneOf: ['admin', 'user', 'guest'] }
                    })
                })
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();
        });

        it('should build validation schema on first access', () =>
        {
            const userModel = modelRegistry.get('user');
            expect(userModel?.validationSchema).toBeUndefined();

            const schema = modelRegistry.getValidation('user');

            expect(schema).toBeDefined();
            expect(userModel?.validationSchema).toBeDefined();
            expect(userModel?.validationSchema).toBe(schema); // Should be cached
        });

        it('should return cached validation schema on subsequent access', () =>
        {
            const schema1 = modelRegistry.getValidation('user');
            const schema2 = modelRegistry.getValidation('user');

            expect(schema1).toBe(schema2); // Same object reference
        });

        it('should validate data using built schema', async () =>
        {
            const schema = modelRegistry.getValidation('user');

            // Valid data should pass
            const validData = {
                email: 'test@example.com',
                age: 25,
                role: 'user'
            };

            expect(await schema.isValid(validData)).toBe(true);

            // Invalid data should fail
            const invalidData = {
                email: 'not-an-email',
                age: -5,
                role: 'invalid-role'
            };

            expect(await schema.isValid(invalidData)).toBe(false);
        });

        it('should return empty schema for non-existent models', () =>
        {
            const schema = modelRegistry.getValidation('nonexistent');

            expect(schema).toEqual({});
        });

        it('should return empty schema for models without schema', async () =>
        {
            const definitions = {
                empty: { name: 'empty' } // No schema property
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();

            const schema = modelRegistry.getValidation('empty');

            expect(schema).toEqual({});
        });
    });

    describe('Complex Field Validation', () =>
    {
        beforeEach(async () =>
        {
            const definitions = {
                complex: makeModelDefinition('complex', {
                    stringField: makeFieldDefinition('string', {
                        validation: { min: 3, max: 50 },
                        requiredOnCreate: true
                    }),
                    numberField: makeFieldDefinition('integer', {
                        validation: { min: 1, max: 100 }
                    }),
                    enumField: makeFieldDefinition('enum', {
                        values: ['option1', 'option2', 'option3']
                    }),
                    booleanField: makeFieldDefinition('boolean'),
                    dateField: makeFieldDefinition('date'),
                    emailField: makeFieldDefinition('string', { format: 'email' }),
                    urlField: makeFieldDefinition('string', { format: 'url' })
                })
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();
        });

        it('should validate string field constraints', async () =>
        {
            const schema = modelRegistry.getValidation('complex');

            // Valid string
            expect(await schema.isValid({ stringField: 'valid' })).toBe(true);

            // Too short
            expect(await schema.isValid({ stringField: 'ab' })).toBe(false);

            // Too long
            const longString = 'a'.repeat(51);
            expect(await schema.isValid({ stringField: longString })).toBe(false);
        });

        it('should validate number field constraints', async () =>
        {
            const schema = modelRegistry.getValidation('complex');

            // Valid number
            expect(await schema.isValid({ numberField: 50 })).toBe(true);

            // Below minimum
            expect(await schema.isValid({ numberField: 0 })).toBe(false);

            // Above maximum
            expect(await schema.isValid({ numberField: 101 })).toBe(false);

            // Must be integer
            expect(await schema.isValid({ numberField: 50.5 })).toBe(false);
        });

        it('should validate enum field options', async () =>
        {
            const schema = modelRegistry.getValidation('complex');

            // Valid option
            expect(await schema.isValid({ enumField: 'option1' })).toBe(true);
            expect(await schema.isValid({ enumField: 'option2' })).toBe(true);

            // Invalid option
            expect(await schema.isValid({ enumField: 'invalid' })).toBe(false);
        });

        it('should validate format-specific fields', async () =>
        {
            const schema = modelRegistry.getValidation('complex');

            // Valid email
            expect(await schema.isValid({ emailField: 'test@example.com' })).toBe(true);

            // Invalid email
            expect(await schema.isValid({ emailField: 'not-an-email' })).toBe(false);

            // Valid URL
            expect(await schema.isValid({ urlField: 'https://example.com' })).toBe(true);

            // Invalid URL
            expect(await schema.isValid({ urlField: 'not-a-url' })).toBe(false);
        });

        it('should validate boolean and date fields', async () =>
        {
            const schema = modelRegistry.getValidation('complex');

            // Valid boolean
            expect(await schema.isValid({ booleanField: true })).toBe(true);
            expect(await schema.isValid({ booleanField: false })).toBe(true);

            // Valid date
            expect(await schema.isValid({ dateField: new Date() })).toBe(true);
            expect(await schema.isValid({ dateField: '2023-01-01' })).toBe(true);

            // Invalid date
            expect(await schema.isValid({ dateField: 'not-a-date' })).toBe(false);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle models with no fields', async () =>
        {
            const definitions = {
                empty: makeModelDefinition('empty', {})
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();

            const schema = modelRegistry.getValidation('empty');

            expect(await schema.isValid({})).toBe(true);
        });

        it('should handle malformed field definitions by throwing', async () =>
        {
            const definitions = {
                malformed: {
                    name: 'malformed',
                    schema: {
                        validField: makeFieldDefinition('string'),
                        invalidField: null, // Invalid field definition
                    }
                }
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();

            // Should throw when building schema with null field definition
            expect(() => modelRegistry.getValidation('malformed')).toThrow();
        });

        it('should handle field definitions with missing properties', async () =>
        {
            const definitions = {
                partialFields: {
                    name: 'partialFields',
                    schema: {
                        validField: makeFieldDefinition('string'),
                        emptyField: { type: 'string' } // Missing validation property
                    }
                }
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();

            const schema = modelRegistry.getValidation('partialFields');

            // Should handle fields with missing validation
            expect(await schema.isValid({ validField: 'test', emptyField: 'test' })).toBe(true);
        });

        it('should handle undefined field values by throwing', async () =>
        {
            const definitions = {
                withUndefined: {
                    name: 'withUndefined',
                    schema: {
                        validField: makeFieldDefinition('string'),
                        undefinedField: undefined // This will cause issues
                    }
                }
            };

            mockGetModelDefinitions.mockResolvedValueOnce({
                data: definitions,
                status: 200
            });
            await modelRegistry.load();

            // Should throw when trying to build schema with undefined field
            expect(() => modelRegistry.getValidation('withUndefined')).toThrow();
        });

        it('should handle definition updates by reloading', async () =>
        {
            // Initial load
            mockGetModelDefinitions.mockResolvedValueOnce({
                data: {
                    user: makeModelDefinition('user', {
                        name: makeFieldDefinition('string')
                    })
                },
                status: 200
            });

            await modelRegistry.load();
            expect(modelRegistry.has('user')).toBe(true);

            // Updated definitions
            mockGetModelDefinitions.mockResolvedValueOnce({
                data: {
                    user: makeModelDefinition('user', {
                        name: makeFieldDefinition('string'),
                        email: makeFieldDefinition('string', { format: 'email' })
                    }),
                    product: makeModelDefinition('product')
                },
                status: 200
            });

            await modelRegistry.load();

            const updatedUser = modelRegistry.get('user');
            expect(updatedUser?.schema.email).toBeDefined();
            expect(modelRegistry.has('product')).toBe(true);
        });

        it('should rebuild validation schema after reload when definition changes', async () =>
        {
            // Initial load + cache schema
            mockGetModelDefinitions.mockResolvedValueOnce({
                data: {
                    user: makeModelDefinition('user', {
                        name: makeFieldDefinition('string')
                    })
                },
                status: 200
            });
            await modelRegistry.load();
            const schemaV1 = modelRegistry.getValidation('user');
            await expect(schemaV1.isValid({ name: 'ok' })).resolves.toBe(true);

            // Reload with stricter definition (email required)
            mockGetModelDefinitions.mockResolvedValueOnce({
                data: {
                    user: makeModelDefinition('user', {
                        name: makeFieldDefinition('string', { validation: { min: 5 } }), // Make name stricter
                        email: makeFieldDefinition('string', { format: 'email' })
                    })
                },
                status: 200
            });
            await modelRegistry.load();
            const schemaV2 = modelRegistry.getValidation('user');

            // Cache invalidation works correctly - new schema is built
            expect(schemaV2).not.toBe(schemaV1); // Different objects as expected

            // New schema enforces updated rules
            await expect(schemaV2.isValid({ name: 'ok' })).resolves.toBe(false); // Fails - name too short (min 5)
            await expect(schemaV2.isValid({ name: 'valid_name' })).resolves.toBe(true); // Passes with longer name
        });
    });
});