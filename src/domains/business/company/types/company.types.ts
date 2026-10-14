import type { Partnership } from '../../partnership/types/partnership.types';

/**
 * Company Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export interface Company
{
    id: string;
    ownerId: string;

    name: string;
    icon?: string;

    contactEmail?: string;
    phoneNumber?: string;
    addressId?: string;
    websiteUrl?: string;
    rating?: number;

    taxIdentifier?: string;
    taxIdentifierType?: 'abn' | 'ein' | 'vat' | 'gst' | 'company_number';

    currentState?: {
        name?: string;
        stateCategory?: { color?: string };
    };

    createdAt?: string;
    updatedAt?: string;
    /** Set only on a row read with `includeDeleted` — a trash view is the only reader. */
    deletedAt?: string;

    /**
     * Hydrated by company.service — `partnership` is in the default includes.
     * Carries the relationship types and their states, which is where a
     * company's types and aggregate status come from.
     *
     * Named to match the wire: the association alias is `partnership`
     * (singular), so that is the JSON key the server nests the array under —
     * confirmed against the live response, not assumed from the alias.
     */
    partnership?: Partnership[];
}
