/**
 * Partnership Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

import type { Company } from '../../company/types/company.types';
import type { SystemType } from '@/domains/system';

/**
 * Represents a specific partnership relationship between the account and an external company.
 * A single company can have multiple partnerships (e.g. both supplier and stockist).
 * Contact info, rating, and notes are relationship-specific — not stored on Company.
 */
export interface Partnership
{
    /** Primary key — read only. */
    id: string;
    /** Foreign key to account. Determines permission scope. Set on create, never updated. */
    ownerId: string;
    /** Foreign key to the external company this partnership is with. */
    companyId: string;
    /** Foreign key to the partnership type catalog. Resolve via typeRegistry. Required on create. */
    partnershipTypeId: string;
    /** Name of the primary contact person for this partnership. */
    contactName?: string;
    /** Email of the primary contact for this partnership. */
    contactEmail?: string;
    /** Phone number of the primary contact for this partnership. */
    contactPhone?: string;
    /** 1–5 quality/performance score for this partnership, assigned by the account. */
    rating?: number;
    /** Free-form notes about this partnership relationship. */
    notes?: string;
    /** Date the partnership began. */
    startedAt?: string;
    /** Date the partnership ended, if applicable. */
    endedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    /** State graph foreign keys — managed by the backend state engine. */
    stateGraphId?: string;
    currentStateGraphStateId?: string;
    previousStateGraphStateId?: string;
    enteredCurrentStateAt?: string;
    /** Hydrated company reference — included via company include. */
    company?: Company;
    /** Hydrated type reference — only present when the partnershipType include is requested. */
    partnershipType?: SystemType;
}
