import { describe, it, expect, beforeAll, vi } from 'vitest';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { ruleRegistry } from '@/core/businessRules/RuleRegistry';
import '@/core/validation/yup/yupExtensions';

// Mock getConfig to provide test defaults
vi.mock('@/domains/config/services/ConfigManager', () => ({
    getConfig: () => ({
        validation: {
            age: {
                min: 13,
                max: 120,
            },
        },
    }),
}));

/**
 * Behavioral tests for validDob Yup extension with rule integration.
 *
 * Tests real behavior: RuleRegistry → Yup validation
 * Only mocks: External API calls (rule bundle fetch)
 */
describe('validDob Yup Extension - Rule Integration', () =>
{
    beforeAll(async () =>
    {
        // Load a real rule bundle structure (same as backend returns)
        const mockRuleBundle = {
            region: {
                global: {
                    accountTypeLevel: {
                        0: {
                            identity: {
                                operation: {
                                    create: {
                                        verification: {
                                            minAge: 18,
                                            maxAge: 100,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                au: {
                    accountTypeLevel: {
                        0: {
                            identity: {
                                operation: {
                                    create: {
                                        verification: {
                                            minAge: 16,
                                            maxAge: 100,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                us: {
                    accountTypeLevel: {
                        0: {
                            identity: {
                                operation: {
                                    create: {
                                        verification: {
                                            minAge: 13,
                                            maxAge: 100,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                uk: {
                    accountTypeLevel: {
                        0: {
                            identity: {
                                operation: {
                                    create: {
                                        verification: {
                                            minAge: 16,
                                            maxAge: 100,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        // Load bundle into registry (simulates bootstrap)
        (ruleRegistry as any).bundle = mockRuleBundle;
    });

    describe('Global region (default)', () =>
    {
        const context = {
            service: 'identity',
            operation: 'create',
            regionCode: 'global'
        };

        it('should accept valid age (18+)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const validDob = dayjs().subtract(20, 'year').toDate();

            await expect(schema.validate({ dob: validDob }, { context })).resolves.toEqual({ dob: validDob });
        });

        it('should reject underage (< 18)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const underageDob = dayjs().subtract(15, 'year').toDate();

            await expect(schema.validate({ dob: underageDob }, { context }))
                .rejects
                .toThrow();
        });

        it('should reject overage (> 100)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const overageDob = dayjs().subtract(105, 'year').toDate();

            await expect(schema.validate({ dob: overageDob }, { context }))
                .rejects
                .toThrow();
        });
    });

    describe('Region-specific validation via context', () =>
    {
        it('should accept 17-year-old in Australia (minAge: 16)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const validAuDob = dayjs().subtract(17, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'au' };

            await expect(
                schema.validate({ dob: validAuDob }, { context })
            ).resolves.toEqual({ dob: validAuDob });
        });

        it('should reject 15-year-old in Australia (minAge: 16)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const underageAuDob = dayjs().subtract(15, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'au' };

            await expect(
                schema.validate({ dob: underageAuDob }, { context })
            )
                .rejects
                .toThrow();
        });

        it('should accept 14-year-old in US (minAge: 13)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const validUsDob = dayjs().subtract(14, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'us' };

            await expect(
                schema.validate({ dob: validUsDob }, { context })
            ).resolves.toEqual({ dob: validUsDob });
        });

        it('should reject 12-year-old in US (minAge: 13)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const underageUsDob = dayjs().subtract(12, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'us' };

            await expect(
                schema.validate({ dob: underageUsDob }, { context })
            )
                .rejects
                .toThrow();
        });
    });

    describe('UK region validation', () =>
    {
        it('should accept 17-year-old in UK (minAge: 16)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const validUkDob = dayjs().subtract(17, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'uk' };

            await expect(schema.validate({ dob: validUkDob }, { context })).resolves.toEqual({ dob: validUkDob });
        });

        it('should reject 15-year-old in UK (minAge: 16)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const underageUkDob = dayjs().subtract(15, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'uk' };

            await expect(schema.validate({ dob: underageUkDob }, { context }))
                .rejects
                .toThrow();
        });
    });

    describe('Edge cases', () =>
    {
        it('should allow undefined when field is optional', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob(),
            });

            // Undefined/missing field passes validation
            await expect(schema.validate({})).resolves.toEqual({});
        });

        it('should validate boundary age (exactly 18 years old)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const exactlyEighteen = dayjs().subtract(18, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'global' };

            await expect(schema.validate({ dob: exactlyEighteen }, { context })).resolves.toEqual({ dob: exactlyEighteen });
        });

        it('should validate boundary age (exactly minAge for region)', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            // Exactly 16 years old for Australia
            const exactlySixteen = dayjs().subtract(16, 'year').toDate();
            const context = { service: 'identity', operation: 'create', regionCode: 'au' };

            await expect(
                schema.validate({ dob: exactlySixteen }, { context })
            ).resolves.toEqual({ dob: exactlySixteen });
        });

        it('should fall back to COPPA defaults (minAge=13) when no rule available', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const seventeenYearsOld = dayjs().subtract(17, 'year').toDate();
            const context = { isUpdate: true }; // No service/operation

            // Should pass with fallback minAge=16
            await expect(
                schema.validate({ dob: seventeenYearsOld }, { context }))
                .resolves.toEqual({ dob: seventeenYearsOld }
                );
        });

        it('should reject with fallback defaults when too young', async () =>
        {
            const schema = yup.object({
                dob: yup.date().validDob().required(),
            });

            const twelveYearsOld = dayjs().subtract(12, 'year').toDate();
            const context = { isUpdate: true }; // No service/operation

            // Should fail with fallback minAge=13
            await expect(schema.validate({ dob: twelveYearsOld }, { context }))
                .rejects
                .toThrow();
        });
    });
});
