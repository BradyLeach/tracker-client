/**
 * State Graph Translations
 *
 * Keyed by the snake_case `label`, which is the stable identifier — the same contract the
 * type catalogs and states use. These are bootstrapped, never user-created, so the set is
 * finite and changes only when the seed does.
 *
 * Labels are identifiers, never display text — a missing key must surface as a missing key,
 * not fall back to the raw label.
 */
const stateGraphs = {
    company: "Partnership",
    lifecycle: "Lifecycle",
} as const;

export default stateGraphs;
