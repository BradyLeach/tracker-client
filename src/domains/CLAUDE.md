See also: ../../CLAUDE.md — the absolute rules. Full doc: `docs/LAYER-ARCHITECTURE.md`.

Before implementing relationship reads or changing a domain service, read
[../services/domain/CLAUDE.md](../services/domain/CLAUDE.md). It documents the existing
association graph, multi-hop traversal, join behavior, and composition reference paths.

**Before building any domain screen, read the relevant playground in `../devTools/`.** Tables,
cards, dialogs, forms, toolbars and metrics all already exist there with working config — see
`../devTools/CLAUDE.md`. A domain screen wires existing components together; it does not
introduce new ones.

## Three layers

`config/` → `orchestrators/*.orchestrator.tsx` → page.

**Config is pure data.** A `build*Config.ts` file contains keys, types, alignment, and i18n key
strings — nothing else. No JSX, no render functions, no business logic. Config must stay
serialisable and testable in isolation.

**The orchestrator owns everything that renders or decides.** `renderChildContent`,
`renderGroupContent`, rollup renderers, and all business logic live in
`domains/<x>/orchestrators/*.orchestrator.tsx`. A custom row or group renderer goes in its own
component file and is wired in from the orchestrator.

This layer exists specifically because render functions were leaking into config builders — for
example `buildPartnershipsGroupedTableConfig.tsx` once held inline JSX. Putting them back is a
regression, not a shortcut.

**Collection filters are built by a pure function in the orchestrator.** `build<Domain>Filters`
takes rows (and any related rows it matches through) and returns `{ filters, filterOptions }`.
Type facets use `buildTypeFacet`. The builder receives a `TypeCatalogue` as a required argument
and never imports one — not `typeCatalogue`, not `typeRegistry`. The consuming component passes
`typeCatalogue` from `@/domains/system`, calls the builder in a `useMemo`, and hands the result to
`useCollection` and `CollectionToolbar`; a playground calls the same builder with mock rows and a
mock catalogue. Filters built inline in a component are drift.

## Relationship depth

A domain screen shows **one hop in each direction** — immediate parent and immediate children —
and no further.

- Company → its partnerships and its locations.
- Location → the company it belongs to, and its addresses.

This is scoped, not truncated. Never read a one-hop view as an incomplete chain or propose
extending it on a domain screen; a record's screen that pulls in every link beyond its neighbours
stops being readable.
