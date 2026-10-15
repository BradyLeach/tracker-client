/**
 * Account Reporting Defaults Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export interface AccountReportingDefaults
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    /** IANA time zone, e.g. "Australia/Perth". */
    timeZone: string;
    createdAt?: string;
    updatedAt?: string;
}
