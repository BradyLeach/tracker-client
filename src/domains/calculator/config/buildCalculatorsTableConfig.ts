/**
 * buildCalculatorsTableConfig
 *
 * Table configuration for the calculator library.
 *
 * Calculators are not a model — the registry describes them — so the columns are declared
 * here rather than read from the model registry:
 * 1. Calculator — the registry key, shown as its translated name.
 * 2. Category   — the registry category, shown translated.
 *
 * Card slots: the name titles the card and the category subtitles it.
 *
 * Both columns translate, so the orchestrator supplies their renderers and this file stays
 * free of JSX and i18n lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 */

import type { TableConfig } from '@/components/tables';
import type { CalculatorDescriptor } from '../types/calculator.types';

const CONFIG: TableConfig<CalculatorDescriptor> = {
    columns: [
        {
            key: 'key',
            label: 'pages.calculators.title',
            type: 'text',
            sortable: true,
            card: 'title',
            emphasis: 'primary',
        },
        {
            key: 'category',
            label: 'pages.calculators.category',
            type: 'text',
            sortable: true,
            card: 'subtitle',
            emphasis: 'secondary',
        },
    ],
    emptyMessage: 'pages.calculators.noMatches',
};

export function buildCalculatorsTableConfig(): TableConfig<CalculatorDescriptor>
{
    return CONFIG;
}
