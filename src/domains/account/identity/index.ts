export * from './types/identity.types';
export { identityService } from './services/identity.service';
export { useIdentity } from './hooks/useIdentity';
export { useCurrentIdentity } from './hooks/useCurrentIdentity';
export { useUpdateIdentity } from './hooks/useUpdateIdentity';
export { buildIdentityFormConfig, buildPersonalFormConfig, buildContactFormConfig } from './config/buildIdentityFormConfig';
export { IdentityFormRenderer } from './components/IdentityFormRenderer';
