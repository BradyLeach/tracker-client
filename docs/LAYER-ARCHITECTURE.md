# Layer Architecture

The repository and directory `CLAUDE.md` files define the engineering rules.
This document maps the implemented layers and their responsibilities.

## UI import stack

```text
App code → components/ui → theme/theme-elements → @mui/material
```

App and domain code import the public UI surface, not MUI or theme-elements directly.
The UI surface wraps or exports the themed primitives; theme-elements owns the themed
MUI implementations. Follow existing wrappers and the relevant playground before adding UI.

## Component and domain layers

| Layer | Path | Responsibility |
|---|---|---|
| Theme | `src/theme/` | Palettes, theme compilation, tokens, and MUI overrides |
| Themed primitives | `src/theme/theme-elements/` | Themed MUI implementations |
| Public UI | `src/components/ui/` | Stable app-facing wrappers and exports |
| Shared UI | `src/components/shared/` | Reusable UI behavior such as status and metrics |
| Forms | `src/components/forms/` | Config-driven fields, renderers, and form hooks |
| Tables | `src/components/tables/` | Config-driven table rendering and collection controls |
| Containers | `src/components/container/` | Page and panel scaffolds |
| Navigation | `src/components/navbar/` | Navbar and navigation composition |
| Model registry | `src/core/models/` | Backend definitions, association metadata, and reference lookups |
| Config builders | `src/domains/{x}/config/` | Serializable keys, field selection, order, and display structure |
| Orchestrators | `src/domains/{x}/orchestrators/` | Render callbacks, derived display behavior, and domain decisions |
| Domain services | `src/domains/{x}/services/` | Domain data access and consumer-facing relationships |
| Domain hooks | `src/domains/{x}/hooks/` | React integration for reads and mutations |
| Pages | `src/domains/{x}/pages/` | Assemble data, configuration, behavior, and user intent |

Config builders contain no JSX, render functions, or business logic. Render callbacks
and behavior belong in orchestrators, wired from pages. Factories translate schema into
generic field/column structure without domain policy. Config carries i18n keys rather than
translated strings; components and render callbacks translate when presenting values.

## Schema and rendering flow

```text
Backend ModelDefinition → ModelRegistry → generic field/column factory
  → domain config builder → smart form/table renderer → public UI
```

Orchestrators supply behavior alongside config. `useCollection` owns search, facet
filtering, sorting, and pagination; table renderers display the resulting rows and report intent.

## Client data layers

```text
Page → domain hook → domain service / createDomainStore
  → DataStore (reactive local reads)
  → DataService → ApiService → REST (when fetching or writing)
  → shared shredder → DataStore → observers re-emit
```

DataService is uncached transport. `createDomainStore` invokes shredding and owns scope,
request state, include handling, and composition. Dexie stores flat entities and FK indexes.
The model registry supplies association descriptors; multi-hop relationships use explicit
composition and successive indexed lookups. Includes load records and confirm completeness;
they do not automatically reconstruct nested read shapes.

Read [the domain data contract](../src/services/domain/CLAUDE.md) and
[store lifecycle rules](../src/services/dataStore/CLAUDE.md) before changing this pipeline.
The [detailed client-data architecture](client-data-architecture-design.md) explains the
implementation and rationale. Direct uncached reads remain appropriate for data deliberately
outside entity storage, such as the company trash view and non-entity rule bundles.

## Advisory rules

`src/core/businessRules/RuleEngine.ts` reads RuleRegistry and delegates checks to registered
checkers. It returns results and data; it does not decide warning thresholds or presentation.
`resolveRuleMessage` translates results, and `useRuleCheck` provides React integration.
Parents own warnings, dialogs, and other UI decisions. `RuleGate` provides a simple loading
fallback and allowed/blocked child rendering.

Frontend checks fail open; the backend remains authoritative. Stable enforcer categories
are LIMIT, VERIFICATION, FEATURE, and COMPLIANCE.

## Related guidance

- [Root engineering rules](../CLAUDE.md)
- [Component guidance](../src/components/CLAUDE.md)
- [Domain guidance](../src/domains/CLAUDE.md)
- [Theme system](THEME-SYSTEM.md)
