/**
 * Ingest Domain — Public API
 *
 * Stable import surface for all ingest sub-domains.
 * Import from here, never from internal paths.
 */

// IngestKey
export type {
    IngestKey,
    IngestKeyType
} from './ingestKey';
export {
    ingestKeyService,
    useIngestKeys,
    useIngestKey,
    useCreateIngestKey,
    useUpdateIngestKey,
    useDeleteIngestKey,
    useRevokeIngestKey
} from './ingestKey';
