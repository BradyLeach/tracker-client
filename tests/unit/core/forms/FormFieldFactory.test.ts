/**
 * FormFieldFactory Unit Tests
 *
 * Tests the form field factory.
 * Only mocks the ModelRegistry boundary, letting real caching and business logic run.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import * as modelRegistry from '@/core/models/ModelRegistry';
import type { ModelDefinition } from '@/core/models/types';
import
{
    makeModelDefinition,
    makeFieldDefinition,
    makeEnumFieldDefinition,
    makeNumberFieldDefinition
} from '@/test-factories/models';

// Mock only the ModelRegistry boundary
vi.mock('@/core/models/ModelRegistry', () => ({
    modelRegistry: {
        get: vi.fn()
    }
}));

const mockModelRegistryGet = vi.mocked(modelRegistry.modelRegistry.get);

describe('FormFieldFactory', () =>
{
    let mockModel: ModelDefinition;

    beforeEach(() =>
    {
        vi.clearAllMocks();

        // Clear the factory cache for clean tests
        formFieldFactory.invalidate();

        // Fresh model object for each test
        mockModel = makeModelDefinition('user', {
            email: makeFieldDefinition('string', { format: 'email', requiredOnCreate: true }),
            name: makeFieldDefinition('text'),
            age: makeNumberFieldDefinition(18, 100)
        });
    });

    afterEach(() =>
    {
        formFieldFactory.invalidate();
    });

    describe('Field Generation', () =>
    {
        it('should generate form fields from model definition', () =>
        {
            mockModelRegistryGet.mockReturnValueOnce(mockModel);

            const fields = formFieldFactory.getFormFields('user');

            expect(fields).toEqual([
                {
                    name: 'email',
                    type: 'email',
                    required: true
                },
                {
                    name: 'name',
                    type: 'text',
                    required: false
                },
                {
                    name: 'age',
                    type: 'number',
                    required: false,
                    props: { min: 18, max: 100 }
                }
            ]);
        });

        it('should throw error when model not found', () =>
        {
            mockModelRegistryGet.mockReturnValueOnce(undefined);

            expect(() => formFieldFactory.getFormFields('missing-model'))
                .toThrow('Model not found: missing-model');
        });
    });

    describe('Type Mapping', () =>
    {
        it.each<[string, 'email' | 'password' | 'url' | undefined, string]>([
            ['string', undefined, 'text'],
            ['string', 'email', 'email'],
            ['string', 'password', 'password'],
            ['string', 'url', 'url'],
            ['text', undefined, 'text'],
            ['enum', undefined, 'select'],
            ['boolean', undefined, 'checkbox'],
            ['date', undefined, 'date'],
            ['datetime', undefined, 'date'],
            ['dayjs', undefined, 'date'],
            ['number', undefined, 'number'],
            ['integer', undefined, 'number'],
            ['unknown-type', undefined, 'text']
        ])('should map %s with format %s to %s', (rawType, format, expectedType) =>
        {
            const model = makeModelDefinition('test', {
                field: makeFieldDefinition(rawType, { format })
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0].type).toBe(expectedType);
        });
    });

    describe('Select Field Options', () =>
    {
        it('should build options from values array (strings)', () =>
        {
            const model = makeModelDefinition('test', {
                status: makeEnumFieldDefinition(['active', 'inactive', 'pending'])
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0]).toMatchObject({
                name: 'status',
                type: 'select',
                options: [
                    { value: 'active', label: 'active' },
                    { value: 'inactive', label: 'inactive' },
                    { value: 'pending', label: 'pending' }
                ]
            });
        });

        it('should build options from values array (objects)', () =>
        {
            const model = makeModelDefinition('test', {
                priority: makeEnumFieldDefinition([
                    { value: 1, label: 'Low' },
                    { value: 2, label: 'Medium' },
                    { value: 3, label: 'High' }
                ])
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0].options).toEqual([
                { value: 1, label: 'Low' },
                { value: 2, label: 'Medium' },
                { value: 3, label: 'High' }
            ]);
        });

        it('should fallback to validation.oneOf when values not available', () =>
        {
            const model = makeModelDefinition('test', {
                role: makeFieldDefinition('enum', {
                    validation: { oneOf: ['admin', 'user', 'guest'] }
                })
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0].options).toEqual([
                { value: 'admin', label: 'admin' },
                { value: 'user', label: 'user' },
                { value: 'guest', label: 'guest' }
            ]);
        });

        it('should handle missing options gracefully', () =>
        {
            const model = makeModelDefinition('test', {
                status: makeFieldDefinition('enum') // No values or oneOf
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0]).toMatchObject({
                name: 'status',
                type: 'select'
            });
            expect(fields[0].options).toBeUndefined();
        });
    });

    describe('Number Field Props', () =>
    {
        it('should include min/max props for number fields', () =>
        {
            const model = makeModelDefinition('test', {
                score: makeNumberFieldDefinition(0, 100),
                rating: makeNumberFieldDefinition(1), // Only min
                unlimited: makeFieldDefinition('number') // No constraints
            });

            mockModelRegistryGet.mockReturnValueOnce(model);

            const fields = formFieldFactory.getFormFields('test');

            expect(fields[0].props).toEqual({ min: 0, max: 100 });
            expect(fields[1].props).toEqual({ min: 1 });
            expect(fields[2].props).toBeUndefined();
        });
    });

    describe('Caching System', () =>
    {
        it('should cache field configurations on first access', () =>
        {
            mockModelRegistryGet.mockReturnValueOnce(mockModel);

            const fields1 = formFieldFactory.getFormFields('user');
            const fields2 = formFieldFactory.getFormFields('user');

            expect(fields1).toBe(fields2); // Same object reference indicates caching
            expect(mockModelRegistryGet).toHaveBeenCalledTimes(1);
        });

        it('should invalidate specific model from cache', () =>
        {
            mockModelRegistryGet
                .mockReturnValueOnce(mockModel)
                .mockReturnValueOnce(mockModel);

            formFieldFactory.getFormFields('user');
            formFieldFactory.invalidate('user');
            formFieldFactory.getFormFields('user');

            expect(mockModelRegistryGet).toHaveBeenCalledTimes(2);
        });

        it('should clear entire cache', () =>
        {
            const model1 = makeModelDefinition('user');
            const model2 = makeModelDefinition('product');

            mockModelRegistryGet
                .mockReturnValueOnce(model1)
                .mockReturnValueOnce(model2)
                .mockReturnValueOnce(model1)
                .mockReturnValueOnce(model2);

            formFieldFactory.getFormFields('user');
            formFieldFactory.getFormFields('product');

            formFieldFactory.invalidate();

            formFieldFactory.getFormFields('user');
            formFieldFactory.getFormFields('product');

            expect(mockModelRegistryGet).toHaveBeenCalledTimes(4);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle model with no schema fields', () =>
        {
            const emptyModel = makeModelDefinition('empty', {});
            mockModelRegistryGet.mockReturnValueOnce(emptyModel);

            const fields = formFieldFactory.getFormFields('empty');

            expect(fields).toEqual([]);
        });

        it('should handle malformed field definitions by throwing', () =>
        {
            const malformedModel = {
                ...makeModelDefinition('test'),
                schema: {
                    field1: null as any,
                    validField: makeFieldDefinition('string')
                }
            };

            mockModelRegistryGet.mockReturnValueOnce(malformedModel);

            // Should throw when encountering null field definition
            expect(() => formFieldFactory.getFormFields('test')).toThrow();
        });

        it('should handle field definitions with undefined type', () =>
        {
            const modelWithUndefinedType = {
                ...makeModelDefinition('test'),
                schema: {
                    field1: { type: undefined } as any,
                    validField: makeFieldDefinition('string')
                }
            };

            mockModelRegistryGet.mockReturnValueOnce(modelWithUndefinedType);

            const fields = formFieldFactory.getFormFields('test');

            // Should handle field with undefined type (maps to 'text')
            expect(fields).toHaveLength(2);
            expect(fields[0].type).toBe('text'); // undefined maps to 'text' in mapType
            expect(fields[1].type).toBe('text');
        });

        it('should return a new instance after invalidating a model', () =>
        {
            mockModelRegistryGet
                .mockReturnValueOnce(mockModel)
                .mockReturnValueOnce(mockModel);

            const first = formFieldFactory.getFormFields('user');
            formFieldFactory.invalidate('user');
            const second = formFieldFactory.getFormFields('user');

            expect(first).not.toBe(second);
        });
    });
});