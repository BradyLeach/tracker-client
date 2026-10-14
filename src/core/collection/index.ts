/**
 * Collection
 *
 *     raw rows + collection state → pipeline → visibleRows → renderer
 *
 * Search, filtering, A–Z indexing and sorting are data operations and live
 * here. Renderers receive processed rows and never transform them.
 */

export { useCollection } from './useCollection';
export type { UseCollectionResult } from './useCollection';

export { runCollection } from './runCollection';

export { paginate, pageCountOf, clampPage } from './pagination';

export { compareValues, buildComparator, sortRows, rankByPresence } from './comparators';

export {
    groupRows,
    rollupSortValues,
    GROUP_LABEL_KEY,
    GROUP_LABEL_FIELD,
} from './grouping';
export type { CollectionGroup } from './grouping';

export {
    matchesSearch,
    matchesAlphaIndex,
    availableAlphaIndexes,
    resolveSearchFields,
    applyPredicates,
    NON_ALPHA_INDEX,
} from './predicates';

export { EMPTY_COLLECTION_STATE } from './collection.types';
export type {
    ValueType,
    CollectionField,
    CollectionFilter,
    CollectionOptions,
    CollectionState,
    CollectionSort,
    SortDirection,
    SortValue,
    Comparator,
    Predicate,
} from './collection.types';

export { buildTypeFacet } from './typeFilters';
export type { TypeFacet, TypeFacetOptions } from './typeFilters';
