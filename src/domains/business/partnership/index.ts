/**
 * Partnership Sub-Domain — Public API
 *
 * Stable import surface for the partnership sub-domain.
 * Import from here, never from internal paths.
 */

export type { Partnership } from './types/partnership.types';
export { partnershipService } from './services/partnership.service';
export { usePartnerships } from './hooks/usePartnerships';
export { usePartnership } from './hooks/usePartnership';
export { useCreatePartnership } from './hooks/useCreatePartnership';
export { useUpdatePartnership } from './hooks/useUpdatePartnership';
export { useTransitionPartnership } from './hooks/useTransitionPartnership';
export { usePartnershipStateControl } from './hooks/usePartnershipStateControl';
export type { PartnershipStateControl } from './hooks/usePartnershipStateControl';
export { buildPartnershipsTableConfig } from './config/buildPartnershipsTableConfig';
export { buildPartnershipsGroupedTableConfig } from './config/buildPartnershipsGroupedTableConfig';
export { getPartnershipsGroupedTableBehavior, getPartnershipMetricDefinitions } from './orchestrators/partnerships.orchestrator';
export { CreatePartnershipDialog } from './components/CreatePartnershipDialog';
export { DeletePartnershipDialog } from './components/DeletePartnershipDialog';
export type { DeletePartnershipDialogProps } from './components/DeletePartnershipDialog';
export { useDeletePartnership } from './hooks/useDeletePartnership';
export { PartnershipCard } from './components/PartnershipCard';
export type { PartnershipCardProps, PartnershipCardSurface } from './components/PartnershipCard';
