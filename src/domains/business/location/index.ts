export { locationService } from './services/location.service';
export type { Location } from './types/location.types';

export { useLocation } from './hooks/useLocation';
export { useCreateLocation } from './hooks/useCreateLocation';
export { useUpdateLocation } from './hooks/useUpdateLocation';
export { useDeleteLocation } from './hooks/useDeleteLocation';
export { useLocationsByCompany } from './hooks/useLocationsByCompany';

export { buildLocationFormConfig } from './config/buildLocationFormConfig';

export { LocationDialog } from './components/LocationDialog';
export type { LocationDialogProps } from './components/LocationDialog';

export { DeleteLocationDialog } from './components/DeleteLocationDialog';
export type { DeleteLocationDialogProps } from './components/DeleteLocationDialog';
