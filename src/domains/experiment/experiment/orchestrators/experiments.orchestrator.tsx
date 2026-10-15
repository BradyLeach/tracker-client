/**
 * experiments.orchestrator
 *
 * Supplies what the experiments table config cannot express on its own: the
 * status facet, the decision's translated label, and the values search and sort
 * read for columns that store an id or an enum rather than the text they show.
 *
 * Kept out of buildExperimentsTableConfig so that file stays declarative and
 * JSX-free, matching the companies orchestrator.
 *
 * @example
 * ```tsx
 * const config = withExperimentCellRenderers( buildExperimentsTableConfig() );
 * const { filters, filterOptions } = buildExperimentFilters( experiments );
 * const collection = useCollection( experiments, {
 *     fields: config.columns, filters, sortValues: EXPERIMENT_SORT_VALUES,
 * } );
 * ```
 */

import i18n from 'i18next';
import { stateRegistry } from '@/core/models/StateRegistry';
import { timestampOf } from '@/core/utils';
import type { CollectionFilter, SortValue } from '@/core/collection';
import type { CollectionFilterOption } from '@/components/collection';
import type { TableConfig } from '@/components/tables';
import type { Experiment } from '../types/experiment.types';

const STATUS_GROUP = 'status';

/** The translated name of an experiment's current state, or undefined before the registry resolves it. */
export function experimentStatusLabel( experiment: Experiment ): string | undefined
{
    const state = stateRegistry.getState( experiment.currentStateGraphStateId ?? '' );
    return state ? i18n.t( `states.${state.label}` ) : undefined;
}

/**
 * Status as a single facet: ticking Draft and Running means "either".
 *
 * Options come from the states the loaded experiments are actually in, ordered as
 * the graph orders them, so the menu never offers a state that would empty the list.
 */
export function buildExperimentFilters(
    experiments: readonly Experiment[],
): { filters: CollectionFilter<Experiment>[]; filterOptions: CollectionFilterOption[] }
{
    const entries = [...new Set( experiments.map( experiment => experiment.currentStateGraphStateId ) )]
        .filter( ( id ): id is string => !!id )
        .map( id => ( { id, node: stateRegistry.getStateGraphState( id ) } ) )
        .filter( entry => entry.node?.state )
        .sort( ( first, second ) => ( first.node?.sortOrder ?? 0 ) - ( second.node?.sortOrder ?? 0 ) );

    return {
        filters: entries.map( ( { id } ) => ( {
            key: `${STATUS_GROUP}:${id}`,
            group: STATUS_GROUP,
            predicate: experiment => experiment.currentStateGraphStateId === id,
        } ) ),
        filterOptions: entries.map( ( { id, node } ) => ( {
            key: `${STATUS_GROUP}:${id}`,
            label: `states.${node?.state?.label}`,
        } ) ),
    };
}

/**
 * Sort values for the columns whose stored value does not order the way it reads.
 *
 * Status orders by the state's place in the graph — draft before running before
 * concluded — rather than by its id. The end date ranks by its epoch value, so an
 * experiment with no window sorts oldest in either direction.
 */
export const EXPERIMENT_SORT_VALUES: Readonly<Record<string, SortValue<Experiment>>> = {
    currentStateGraphStateId: experiment =>
        stateRegistry.getStateGraphState( experiment.currentStateGraphStateId ?? '' )?.sortOrder ?? 0,
    windowEnd: experiment => timestampOf( experiment.windowEnd ),
};

/** A decision reads as its translated label; an experiment not yet concluded has none. */
export function experimentDecisionLabel( experiment: Experiment ): string
{
    return experiment.decision ? i18n.t( `forms.conclusion.options.${experiment.decision}` ) : '—';
}

/**
 * Attaches the renderers and search values for the columns that store an id or an
 * enum. Status keeps the table's own state renderer; only its search text is added.
 */
export function withExperimentCellRenderers( config: TableConfig<Experiment> ): TableConfig<Experiment>
{
    return {
        ...config,
        columns: config.columns.map( column =>
        {
            if( column.key === 'currentStateGraphStateId' )
            {
                return { ...column, searchValue: experimentStatusLabel };
            }

            if( column.key === 'decision' )
            {
                return { ...column, render: experimentDecisionLabel, searchValue: experimentDecisionLabel };
            }

            return column;
        } ),
    };
}
