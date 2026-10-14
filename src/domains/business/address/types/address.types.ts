/**
 * Address Types
 *
 * The Address interface mirrors the backend model definition. An address is immutable
 * once referenced — relationship records (LocationAddress etc.) point at it rather than
 * editing it in place.
 */

export interface Address
{
    id: string;
    ownerId: string;
    countryId: string;
    subdivisionId?: string;
    city?: string;
    postalCode?: string;
    line1?: string;
    line2?: string;
    label?: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}
