/**
 * Company Domain — Public API
 *
 * Stable import surface for all company sub-domains.
 * Import from here, never from internal paths.
 */

// Company
export type { Company } from './company';
export { companyService, useCompanies, useCompany, useUpdateCompany, buildCompanyFormConfig, EditCompanyDialog, CompanyHeader } from './company';
export type { EditCompanyDialogProps, CompanyHeaderProps } from './company';

// Partnership
export type { Partnership } from './partnership';
export { partnershipService, usePartnerships, usePartnership, useCreatePartnership, useUpdatePartnership, useTransitionPartnership, usePartnershipStateControl, buildPartnershipsTableConfig, buildPartnershipsGroupedTableConfig, getPartnershipsGroupedTableBehavior, getPartnershipMetricDefinitions, CreatePartnershipDialog } from './partnership';
export type { PartnershipStateControl } from './partnership';

// Pages
export { PageCompanies } from './pages/PageCompanies';
