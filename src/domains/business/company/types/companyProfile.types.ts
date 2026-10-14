/**
 * Company Profile Types
 *
 * Shapes the profile page reads that are not part of the Company record
 * itself. Each has a service that is currently mocked; these types are the
 * contract the real endpoints must satisfy.
 */

/** A mappable point. CompanyAddress and CompanyLocation both resolve to this. */
export interface CompanyLocationPoint
{
    id: string;
    /** 'address' for CompanyAddress, 'location' for CompanyLocation. */
    source: 'address' | 'location';
    label: string;
    /** Single-line address for display. */
    addressLine?: string;
    lat: number;
    lng: number;
}
