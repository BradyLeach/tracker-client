/**
 * Public Profile Context API.
 *
 * Import from this module for the provider, hook, and runtime accessors.
 * The provider lives separately so its module exports only a React component,
 * allowing Fast Refresh. Shared context and runtime state live in Profile.state.ts.
 */
export { ProfileProvider } from './Profile.provider';
export { useProfile, getProfileState, getProfileSetters } from './Profile.state';
