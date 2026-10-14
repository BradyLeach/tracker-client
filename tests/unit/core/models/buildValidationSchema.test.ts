/**
 * buildValidationSchema Unit Tests
 *
 * Tests the Yup schema building logic with minimal mocking.
 * Only mocks fieldJsonToYup for isolation, testing real schema composition.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildValidationSchema } from '@/core/models/buildValidationSchema';
import * as fieldJsonToYup from '@/core/models/fieldJsonToYup';
import * as yup from 'yup';
import { makeFieldDefinition } from '@/test-factories/models';

// Mock only the fieldJsonToYup boundary for focused testing
vi.mock('@/core/models/fieldJsonToYup', () => ({
    fieldJsonToYup: vi.fn()
}));

const mockFieldJsonToYup = vi.mocked(fieldJsonToYup.fieldJsonToYup);

describe('buildValidationSchema', () =>
{
    beforeEach(() =>
    {
        vi.resetAllMocks(); // safer than clearAllMocks - prevents mock state leakage
    });

    describe('Schema Construction', () =>
    {
        it('should build empty schema for empty fields', () =>
        {
            const schema = buildValidationSchema({});

            expect(schema).toBeDefined();
            expect(yup.isSchema(schema)).toBe(true);
        });

        it('should call fieldJsonToYup for each field definition', () =>
        {
            const mockStringSchema = yup.string();
            const mockNumberSchema = yup.number();

            mockFieldJsonToYup
                .mockReturnValueOnce(mockStringSchema)
                .mockReturnValueOnce(mockNumberSchema);

            const fields = {
                name: makeFieldDefinition('string'),
                age: makeFieldDefinition('number')
            };

            buildValidationSchema(fields);

            expect(mockFieldJsonToYup).toHaveBeenCalledTimes(2);
        });

        it('should create object schema with correct field mapping', () =>
        {
            const mockStringSchema = yup.string().required();
            const mockNumberSchema = yup.number().min(0);

            mockFieldJsonToYup
                .mockReturnValueOnce(mockStringSchema)
                .mockReturnValueOnce(mockNumberSchema);

            const fields = {
                name: makeFieldDefinition('string', { requiredOnCreate: true }),
                age: makeFieldDefinition('number', { validation: { min: 0 } })
            };

            const schema = buildValidationSchema(fields);

            // Schema should be a Yup object schema
            expect(yup.isSchema(schema)).toBe(true);
            expect(schema.type).toBe('object');
        });

        it('should handle single field correctly', () =>
        {
            const mockSchema = yup.string().email();
            mockFieldJsonToYup.mockReturnValueOnce(mockSchema);

            const fields = {
                email: makeFieldDefinition('string', { format: 'email' })
            };

            const schema = buildValidationSchema(fields);

            expect(mockFieldJsonToYup).toHaveBeenCalledTimes(1);
            expect(yup.isSchema(schema)).toBe(true);
        });
    });

    describe('Field Processing Order', () =>
    {
        it('should process all fields', () =>
        {
            mockFieldJsonToYup.mockReturnValue(yup.mixed());

            const fields = {
                field1: makeFieldDefinition('string'),
                field2: makeFieldDefinition('number'),
                field3: makeFieldDefinition('boolean')
            };

            buildValidationSchema(fields);

            expect(mockFieldJsonToYup).toHaveBeenCalledTimes(3);
        });
    });

    describe('Schema Integration', () =>
    {
        it('should create functional validation schema', async () =>
        {
            // Use real Yup schemas instead of mocks for integration test
            mockFieldJsonToYup
                .mockReturnValueOnce(yup.string().required())
                .mockReturnValueOnce(yup.number().min(0).max(150))
                .mockReturnValueOnce(yup.string().email());

            const fields = {
                name: makeFieldDefinition('string', { requiredOnCreate: true }),
                age: makeFieldDefinition('number', { validation: { min: 0, max: 150 } }),
                email: makeFieldDefinition('string', { format: 'email' })
            };

            const schema = buildValidationSchema(fields);

            // Valid data should pass
            const validData = {
                name: 'John Doe',
                age: 30,
                email: 'john@example.com'
            };

            expect(await schema.isValid(validData)).toBe(true);

            // Invalid data should fail
            const invalidData = {
                name: '', // Required field missing
                age: 200, // Above max
                email: 'not-an-email' // Invalid format
            };

            expect(await schema.isValid(invalidData)).toBe(false);
        });

        it('should validate individual field requirements', async () =>
        {
            mockFieldJsonToYup
                .mockReturnValueOnce(yup.string().required())
                .mockReturnValueOnce(yup.number().positive());

            const fields = {
                requiredField: makeFieldDefinition('string', { requiredOnCreate: true }),
                positiveNumber: makeFieldDefinition('number', { validation: { min: 0 } })
            };

            const schema = buildValidationSchema(fields);

            // Test required field validation
            expect(await schema.isValid({ positiveNumber: 5 })).toBe(false); // Missing required
            expect(await schema.isValid({ requiredField: 'test', positiveNumber: 5 })).toBe(true);

            // Test number validation
            expect(await schema.isValid({ requiredField: 'test', positiveNumber: -1 })).toBe(false);
            expect(await schema.isValid({ requiredField: 'test', positiveNumber: 1 })).toBe(true);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle null and undefined field definitions', () =>
        {
            mockFieldJsonToYup.mockReturnValue(yup.mixed());

            const fields = {
                validField: makeFieldDefinition('string'),
                nullField: null as any,
                undefinedField: undefined as any
            };

            expect(() => buildValidationSchema(fields)).not.toThrow();
            expect(yup.isSchema(buildValidationSchema(fields))).toBe(true);
        });

        it('should handle fieldJsonToYup throwing errors', () =>
        {
            mockFieldJsonToYup
                .mockReturnValueOnce(yup.string())
                .mockImplementationOnce(() => { throw new Error('Invalid field'); })
                .mockReturnValueOnce(yup.number());

            const fields = {
                validField1: makeFieldDefinition('string'),
                invalidField: makeFieldDefinition('unknown' as any),
                validField2: makeFieldDefinition('number')
            };

            expect(() => buildValidationSchema(fields)).toThrow();
        });

        it('should handle empty field names', () =>
        {
            mockFieldJsonToYup.mockReturnValue(yup.string());

            const fields = {
                '': makeFieldDefinition('string'),
                ' ': makeFieldDefinition('number'),
                'validName': makeFieldDefinition('boolean')
            };

            const schema = buildValidationSchema(fields);

            expect(mockFieldJsonToYup).toHaveBeenCalledTimes(3);
            expect(yup.isSchema(schema)).toBe(true);
        });

        it('should handle large number of fields', () =>
        {
            mockFieldJsonToYup.mockReturnValue(yup.mixed());

            // Create 100 fields
            const fields: Record<string, any> = {};
            for (let i = 0; i < 100; i++)
            {
                fields[`field${i}`] = makeFieldDefinition('string');
            }

            const schema = buildValidationSchema(fields);

            expect(mockFieldJsonToYup).toHaveBeenCalledTimes(100);
            expect(yup.isSchema(schema)).toBe(true);
        });
    });

    describe('Return Type Validation', () =>
    {
        it('should return Yup ObjectSchema instance', () =>
        {
            mockFieldJsonToYup.mockReturnValue(yup.string());

            const fields = {
                test: makeFieldDefinition('string')
            };

            const schema = buildValidationSchema(fields);

            expect(yup.isSchema(schema)).toBe(true);
            expect(schema.type).toBe('object');
            expect(typeof schema.validate).toBe('function');
            expect(typeof schema.isValid).toBe('function');
        });
    });
});