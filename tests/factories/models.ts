/**
 * Test factories for model definition objects
 */

import type { ModelDefinition, ModelFieldDefinition } from '@/core/models/types';

export const makeFieldDefinition = (
    type: string,
    options: {
        format?: 'email' | 'url' | 'password';
        requiredOnCreate?: boolean;
        validation?: {
            min?: number;
            max?: number;
            oneOf?: any[];
            format?: 'email' | 'url' | 'password';
        };
        values?: any[];
    } = {}
): ModelFieldDefinition => ({
    type,
    validation: {
        requiredOnCreate: options.requiredOnCreate || false,
        format: options.format,
        ...options.validation
    },
    values: options.values
});

export const makeNumberFieldDefinition = (
    min?: number,
    max?: number,
    required: boolean = false
): ModelFieldDefinition => ({
    type: 'number',
    validation: {
        requiredOnCreate: required,
        ...(min !== undefined && { min }),
        ...(max !== undefined && { max })
    }
});

export const makeEnumFieldDefinition = (
    values: any[],
    required: boolean = false
): ModelFieldDefinition => ({
    type: 'enum',
    validation: {
        requiredOnCreate: required
    },
    values
});

export const makeModelDefinition = (
    name: string,
    schema: Record<string, ModelFieldDefinition> = {}
): ModelDefinition => ({
    name,
    schema
});

export const makeUserModelDefinition = (): ModelDefinition => makeModelDefinition('user', {
    email: makeFieldDefinition('string', {
        format: 'email',
        requiredOnCreate: true
    }),
    password: makeFieldDefinition('string', {
        format: 'password',
        requiredOnCreate: true
    }),
    name: makeFieldDefinition('text'),
    age: makeNumberFieldDefinition(18, 100),
    role: makeEnumFieldDefinition(['admin', 'user', 'guest']),
    isActive: makeFieldDefinition('boolean'),
    birthDate: makeFieldDefinition('date'),
    website: makeFieldDefinition('string', { format: 'url' })
});

export const makeProductModelDefinition = (): ModelDefinition => makeModelDefinition('product', {
    name: makeFieldDefinition('string', { requiredOnCreate: true }),
    price: makeNumberFieldDefinition(0, 9999.99, true),
    category: makeEnumFieldDefinition([
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' }
    ]),
    description: makeFieldDefinition('text'),
    inStock: makeFieldDefinition('boolean')
});