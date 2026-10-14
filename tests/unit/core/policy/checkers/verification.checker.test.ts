/**
 * Verification Enforcer Unit Tests
 *
 * Behavior-focused tests for verification rule enforcer.
 * Tests decision logic (allow/block) based on age, email verification, identity status.
 * Tests return RuleCheckResult with enforcer codes (no UI components).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { RuleCheckContext } from '@/core/businessRules/types';
import type { VerificationRule } from '@/core/businessRules/checkers/verificationHandlers';
import { RULE_CODES } from '@/core/businessRules/ruleCodes';
import dayjs from 'dayjs';

// Import after mock is set up
import { checkVerification } from '@/core/businessRules/checkers/verification.checker';

describe('checkVerification - Behavior', () =>
{
    let context: RuleCheckContext;

    beforeEach(() =>
    {
        vi.clearAllMocks();

        context = {
            service: 'group',
            operation: 'join',
        };
    });

    describe('Age Verification - minAge', () =>
    {
        it('should allow operation when user meets minimum age', async () =>
        {
            const rule: VerificationRule = { minAge: 18 };
            const userDob = dayjs().subtract(20, 'year').toDate(); // 20 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(true);
            expect(result.service).toBe('group');
            expect(result.operation).toBe('join');
        });

        it('should block operation when user is underage', async () =>
        {
            const rule: VerificationRule = { minAge: 18 };
            const userDob = dayjs().subtract(16, 'year').toDate(); // 16 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'minAge',
                expected: 18,
                age: 16,
            });
        });

        it('should block and include all context data when underage', async () =>
        {
            const rule: VerificationRule = { minAge: 18 };
            const userDob = dayjs().subtract(16, 'year').toDate();

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.data?.age).toBe(16);
        });

        it('should allow operation when user is exactly minimum age', async () =>
        {
            const rule: VerificationRule = { minAge: 18 };
            const userDob = dayjs().subtract(18, 'year').toDate(); // Exactly 18

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(true);
        });
    });

    describe('Age Verification - maxAge', () =>
    {
        it('should allow operation when user is under maximum age', async () =>
        {
            const rule: VerificationRule = { maxAge: 100 };
            const userDob = dayjs().subtract(50, 'year').toDate(); // 50 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(true);
        });

        it('should block operation when user exceeds maximum age', async () =>
        {
            const rule: VerificationRule = { maxAge: 100 };
            const userDob = dayjs().subtract(105, 'year').toDate(); // 105 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'maxAge',
                expected: 100,
                age: 105,
            });
        });

        it('should block and include context when overage', async () =>
        {
            const rule: VerificationRule = { maxAge: 100 };
            const userDob = dayjs().subtract(105, 'year').toDate();

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.data?.age).toBe(105);
        });
    });

    describe('Age Verification - Combined min and max', () =>
    {
        it('should allow operation when user is within age range', async () =>
        {
            const rule: VerificationRule = { minAge: 18, maxAge: 65 };
            const userDob = dayjs().subtract(30, 'year').toDate(); // 30 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(true);
        });

        it('should block when user is too young', async () =>
        {
            const rule: VerificationRule = { minAge: 18, maxAge: 65 };
            const userDob = dayjs().subtract(16, 'year').toDate(); // 16 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'minAge',
                expected: 18,
            });
        });

        it('should block when user is too old', async () =>
        {
            const rule: VerificationRule = { minAge: 18, maxAge: 65 };
            const userDob = dayjs().subtract(70, 'year').toDate(); // 70 years old

            const result = await checkVerification(rule, { ...context, userDob });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'maxAge',
                expected: 65,
            });
        });
    });

    describe('Email Verification', () =>
    {
        it('should allow operation when email is verified and required', async () =>
        {
            const rule: VerificationRule = { emailVerified: true };

            const result = await checkVerification(rule, { ...context, emailVerified: true });

            expect(result.allowed).toBe(true);
        });

        it('should block operation when email is not verified but required', async () =>
        {
            const rule: VerificationRule = { emailVerified: true };

            const result = await checkVerification(rule, { ...context, emailVerified: false });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'emailVerified',
                expected: true,
                emailVerified: false,
            });
        });

        it('should include all verification context when email not verified', async () =>
        {
            const rule: VerificationRule = { emailVerified: true };

            const result = await checkVerification(rule, { ...context, emailVerified: false });

            expect(result.allowed).toBe(false);
            expect(result.data?.emailVerified).toBe(false);
        });
    });

    describe('Identity Verification', () =>
    {
        it('should allow operation when identity is verified and required', async () =>
        {
            const rule: VerificationRule = { identityVerified: true };

            const result = await checkVerification(rule, {
                ...context,
                identityVerificationStatus: 'verified',
            });

            expect(result.allowed).toBe(true);
        });

        it('should block operation when identity is not verified but required', async () =>
        {
            const rule: VerificationRule = { identityVerified: true };

            const result = await checkVerification(rule, {
                ...context,
                identityVerificationStatus: 'pending',
            });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data).toMatchObject({
                key: 'identityVerified',
                expected: true,
                identityVerificationStatus: 'pending',
            });
        });

        it('should include verification status when identity not verified', async () =>
        {
            const rule: VerificationRule = { identityVerified: true };

            const result = await checkVerification(rule, {
                ...context,
                identityVerificationStatus: 'pending',
            });

            expect(result.allowed).toBe(false);
            expect(result.data?.identityVerificationStatus).toBe('pending');
        });
    });

    describe('Multiple Verification Requirements', () =>
    {
        it('should allow when all requirements are met', async () =>
        {
            const rule: VerificationRule = {
                minAge: 18,
                emailVerified: true,
                identityVerified: true,
            };

            const userDob = dayjs().subtract(25, 'year').toDate();

            const result = await checkVerification(rule, {
                ...context,
                userDob,
                emailVerified: true,
                identityVerificationStatus: 'verified',
            });

            expect(result.allowed).toBe(true);
        });

        it('should block on first failing requirement (age)', async () =>
        {
            const rule: VerificationRule = {
                minAge: 18,
                emailVerified: true,
            };

            const userDob = dayjs().subtract(16, 'year').toDate(); // Fails age

            const result = await checkVerification(rule, {
                ...context,
                userDob,
                emailVerified: true, // Would pass email
            });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data?.key).toBe('minAge');
        });

        it('should block on first failing requirement (email)', async () =>
        {
            const rule: VerificationRule = {
                minAge: 18,
                emailVerified: true,
            };

            const userDob = dayjs().subtract(25, 'year').toDate(); // Passes age

            const result = await checkVerification(rule, {
                ...context,
                userDob,
                emailVerified: false, // Fails email
            });

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
            expect(result.data?.key).toBe('emailVerified');
        });
    });

    describe('Edge Cases', () =>
    {
        it('should block when userDob is missing but age check required', async () =>
        {
            const rule: VerificationRule = { minAge: 18 };

            // No userDob in context - rule requires it but it's missing = violation
            const result = await checkVerification(rule, context);

            expect(result.allowed).toBe(false);
            expect(result.enforcer).toBe(RULE_CODES.VERIFICATION);
        });

        it('should allow when rule is empty', async () =>
        {
            const emptyRule = {};

            const result = await checkVerification(emptyRule, context);

            expect(result.allowed).toBe(true);
        });

        it('should allow when rule is null', async () =>
        {
            const nullRule = null as any;

            const result = await checkVerification(nullRule, context);

            expect(result.allowed).toBe(true);
        });

        it('should skip unknown verification keys gracefully', async () =>
        {
            const rule: VerificationRule = {
                minAge: 18,
                unknownKey: 'some-value', // No handler for this
            } as any;

            const userDob = dayjs().subtract(25, 'year').toDate();

            const result = await checkVerification(rule, { ...context, userDob });

            // Should pass age check and ignore unknown key
            expect(result.allowed).toBe(true);
        });
    });
});
