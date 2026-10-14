/**
 * State graph domain types.
 * Mirror the backend state graph data model.
 */

export interface StateCategory
{
    id: string;
    name: string;
    /** Semantic palette key: neutral | info | warning | success | muted | danger */
    color: string;
    description?: string;
}

export interface State
{
    id: string;
    name: string;
    /** Stable snake_case identifier — the i18n key. Translate, never render raw. */
    label: string;
    stateCategoryId: string;
    stateCategory?: StateCategory;
}

export interface StateGraphState
{
    id: string;
    stateGraphId: string;
    stateId: string;
    sortOrder: number;
    isTerminal: boolean;
    isDefault: boolean;
    state?: State;
}

export interface Transition
{
    id: string;
    stateGraphId: string;
    name: string;
    /** Stable snake_case identifier — the i18n key. Translate, never render raw. */
    label: string;
    /** Omitted for entry transitions (universal — fires from any state) */
    fromStateGraphStateId?: string;
    toStateGraphStateId: string;
}

export interface StateGraph
{
    id: string;
    name: string;
    /** Stable snake_case identifier — the i18n key. Translate, never render raw. */
    label: string;
    description?: string;
    stateGraphState?: StateGraphState[];
    transition?: Transition[];
}
