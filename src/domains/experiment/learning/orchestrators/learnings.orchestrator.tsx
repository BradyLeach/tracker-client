/**
 * learnings.orchestrator
 *
 * Supplies the experiment column of the learnings list: the title of the experiment each
 * learning came from, read from an index the page builds over the experiments it holds,
 * with the same title for search and sort.
 *
 * Kept out of buildLearningsTableConfig so that file stays declarative and JSX-free,
 * matching the companies orchestrator.
 *
 * @example
 * ```tsx
 * const experimentsById = indexExperimentsById( experiments );
 * const config = withLearningCellRenderers( buildLearningsTableConfig(), experimentsById );
 * ```
 */

import { timestampOf } from '@/core/utils';
import type { SortValue } from '@/core/collection';
import type { TableConfig } from '@/components/tables';
import type { Experiment } from '../../experiment/types/experiment.types';
import type { Learning } from '../types/learning.types';

/** Experiments by id, built once by the page and read by every learning row. */
export function indexExperimentsById( experiments: readonly Experiment[] ): Map<string, Experiment>
{
    return new Map( experiments.map( experiment => [experiment.id, experiment] ) );
}

export function withLearningCellRenderers(
    config: TableConfig<Learning>,
    experimentsById: Map<string, Experiment>,
): TableConfig<Learning>
{
    const titleOf = ( learning: Learning ) => experimentsById.get( learning.experimentId )?.title ?? '—';

    return {
        ...config,
        columns: config.columns.map( column => column.key === 'experimentId'
            ? { ...column, render: titleOf, searchValue: titleOf }
            : column ),
    };
}

/** The experiment column sorts by title; the date by time. */
export function learningSortValues( experimentsById: Map<string, Experiment> ): Readonly<Record<string, SortValue<Learning>>>
{
    return {
        experimentId: learning => experimentsById.get( learning.experimentId )?.title ?? '',
        createdAt: learning => timestampOf( learning.createdAt ),
    };
}
