/**
 * System Type Catalog Types
 *
 * Backend shapes for the system type catalogs that replaced the hardcoded
 * string enums. Read after login, with the rest of the reference data.
 */

/**
 * The fields of a system type record this app reads.
 * Endpoint: GET /system/types
 *
 * `label` is the stable identifier: it is both the i18n key and the English
 * fallback. `id` is what entities store in their `...TypeId` columns.
 *
 * The endpoint returns the record whole, and the same record also arrives nested
 * under an include elsewhere. This is a view of the fields used here, not a
 * description of the payload — the model definitions are the authority on that.
 */
export interface SystemType
{
    id: string;
    label: string;
    description?: string;
    /** Registry key of the icon records of this type are shown with. */
    icon?: string;
}

/**
 * The catalogs the aggregate endpoint returns, named by their model.
 *
 * A catalog is stored under its model name like every other record, so the
 * payload key *is* the table it lands in and nothing has to be mapped. The
 * names are duplicated from the backend rather than derived, because the client
 * has to know which models to project before any response arrives.
 *
 * Account-owned tables named "type" are deliberately
 * absent — they hold per-tenant rows and are fetched through their own routes.
 */
export const SYSTEM_TYPE_MODELS = [
    'addressType',
    'locationType',
    'partnershipType'
] as const;

/** Model name of one system type catalog. */
export type SystemTypeModel = typeof SYSTEM_TYPE_MODELS[number];

/**
 * Full payload of the aggregate endpoint — every catalog in one call.
 * Endpoint: GET /system/types
 */
export type SystemTypeCatalogs = Record<SystemTypeModel, SystemType[]>;

/**
 * Read access to the system type catalogs.
 *
 * Consumers resolve `...TypeId` fields through this contract, never through the
 * registry behind it, so a playground or test supplies its own catalogs without
 * touching global state.
 */
export interface TypeCatalogue
{
    /** The type record for an id, whatever catalog it belongs to. */
    getById( typeId: string | undefined ): SystemType | undefined;
    /** The label for an id, which doubles as the i18n key. */
    getLabel( typeId: string | undefined ): string | undefined;
    /** Every type in one catalog. */
    getByModel( model: SystemTypeModel ): SystemType[];
    /** A catalog and label resolved back to its id. */
    getId( model: SystemTypeModel, label: string ): string | undefined;
}
