export { locationAddressService } from './services/locationAddress.service';
export type { LocationAddress } from './types/locationAddress.types';

export { useLocationAddressesByLocation } from './hooks/useLocationAddressesByLocation';
export { useLocationAddressesByLocations } from './hooks/useLocationAddressesByLocations';
export { useCreateLocationAddress } from './hooks/useCreateLocationAddress';
export { useUpdateLocationAddress } from './hooks/useUpdateLocationAddress';
export { useDeleteLocationAddress } from './hooks/useDeleteLocationAddress';

export { buildLocationAddressFormConfig } from './config/buildLocationAddressFormConfig';

export { LocationAddressDialog } from './components/LocationAddressDialog';
export type { LocationAddressDialogProps } from './components/LocationAddressDialog';

export { RemoveLocationAddressDialog } from './components/RemoveLocationAddressDialog';
export type { RemoveLocationAddressDialogProps } from './components/RemoveLocationAddressDialog';
