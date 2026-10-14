import { resolveRuleMessage } from '@/core/businessRules/resolveRuleMessage';
import { RULE_CODES } from '@/core/businessRules/ruleCodes';

describe('resolveRuleMessage', () =>
{
    it('generates correct i18n key for limit block', () =>
    {
        const result = resolveRuleMessage(
            RULE_CODES.LIMIT,
            'block',
            'program',
            undefined,
            { current: 5, max: 5 }
        );

        expect(result.key).toBe('rule.LIMIT.block.program');
    });

    it('generates specific key for verification age failure', () =>
    {
        const result = resolveRuleMessage(
            RULE_CODES.VERIFICATION,
            'block',
            'identity',
            'age',
            { minAge: 18, actualAge: 16 }
        );

        // Most specific key: rule.{enforcer}.{severity}.{service}.{specific}
        expect(result.key).toBe('rule.VERIFICATION.block.identity.age');
    });

    it('falls back through key hierarchy when specific key missing', () =>
    {
        // Test fallback: specific → service → enforcer → generic
    });
});