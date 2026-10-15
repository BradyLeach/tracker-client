/**
 * Ingest Key Sub-Domain — Public API
 *
 * Stable import surface for the ingest key sub-domain.
 * Import from here, never from internal paths.
 */

export type { IngestKey, IngestKeyType } from './types/ingestKey.types';
export { ingestKeyService } from './services/ingestKey.service';
export { useIngestKeys } from './hooks/useIngestKeys';
export { useIngestKey } from './hooks/useIngestKey';
export { useCreateIngestKey } from './hooks/useCreateIngestKey';
export { useUpdateIngestKey } from './hooks/useUpdateIngestKey';
export { useDeleteIngestKey } from './hooks/useDeleteIngestKey';
export { useRevokeIngestKey } from './hooks/useRevokeIngestKey';
