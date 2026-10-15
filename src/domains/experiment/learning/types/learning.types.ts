/**
 * Learning Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export interface Learning
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    experimentId: string;
    body: string;
    createdAt?: string;
    updatedAt?: string;
}
