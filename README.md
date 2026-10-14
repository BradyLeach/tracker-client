<h1 align="center"> TRACKER - CLIENT </h1>

React frontend for Tracker, a platform for planning, running and measuring traction experiments.

- **Stack:** React + TypeScript + Vite
- **Backend:** Connects to the Tracker API (separate repo: `tracker-server`)

---

## Getting Started

Everything runs in Docker through the launch script. Build the image, then start the dev server:

```bash
./trkc-launch.sh docker
./trkc-launch.sh dev
```

The Vite dev server listens on port 5175 and is served through the `tracker-server` nginx at
`https://192.168.1.104:446`. The preview build listens on 4175 behind nginx on 8446.

---

## Architecture Overview

Bootstrap-first React TypeScript application. Configuration, i18n, models, and auth are loaded before the app renders.

### Key Architectural Patterns

**Client Data and Relationships**

The model registry holds association descriptors. Dexie stores normalized flat entities
indexed by foreign key; relationships at any depth are traversed through successive
lookups. Domain services explicitly compose the shapes consumers need. `joinOne` attaches
a flat target record and does not inherit the target service's composition. REST includes
load related records and establish scope completeness; they do not reconstruct read shapes.

Read [the client data guidance](src/services/domain/CLAUDE.md) for the implemented contract
and working Company, Partnership, Location, Address, and InventoryType examples, and
[the store lifecycle rules](src/services/dataStore/CLAUDE.md) before changing storage.
The [detailed architecture](docs/client-data-architecture-design.md)
explains the implemented pipeline and its rationale. The directory `CLAUDE.md` files
contain the behavioral contract needed by fresh contexts.

**Bootstrap System** (`src/core/bootstrap/`)
- **BootstrapOrchestrator** — Parallel execution engine with critical/non-critical separation
- **Loaders** — Config, I18n, Models, Auth
- **Flow:** `main.tsx` → `bootstrap()` → `renderApp()` → `AppProviders`

**Config-Driven Forms** (`src/components/forms/`)
- **FormScaffold** — Layout contract with strict slot ordering (Header → Feedback → Message → Body → Actions → Footer)
- **BaseFormRenderer** — Form logic, field rendering, and validation
- **WizardFormRenderer** — Multi-step form variant
- **FormFieldFactory** — Auto-generated forms from backend model definitions

**Domain Organization** (`src/domains/`)
- Feature-based structure — one folder per product domain
- Each domain owns its components, hooks, services, types, and pages

---

## Project Structure

```
src/
├── assets/          — Images and static resources
├── components/      — Shared UI components and form system
│   ├── forms/       — FormScaffold, renderers, field components
│   ├── guards/      — Route guards (AuthGuard)
│   └── ui/          — App-facing component wrappers (never import MUI directly)
├── config/          — Layered app config (default → environment → runtime)
├── core/            — Infrastructure: bootstrap, business rules, context, models, validation
├── domains/         — Feature domains (authentication, account, business, etc.)
├── providers/       — React context provider composition
├── routes/          — Router definition
├── services/        — Data service abstraction layer (dataService, http)
└── theme/           — MUI theme config and theme-elements wrappers
```

---

## UI Layer Rules

Three-layer UI stack — never skip a layer:

```
App code → components/ui/ → theme-elements/ → @mui/material
```

- App code imports **only** from `@/components/ui`
- Never import `@mui/material` directly in domain or page code

---

## FormScaffold Usage

All forms follow the same slot structure:

```tsx
<FormScaffold>
  <FormScaffold.Header title="Create Recipe" subtitle="Define ingredients and process" />
  <FormScaffold.Feedback message={error} severity="error" />
  <FormScaffold.Body>
    <BaseFormRenderer config={formConfig} onSubmit={handleSubmit} loading={loading} />
  </FormScaffold.Body>
  <FormScaffold.Actions>
    <Button type="submit" variant="contained">Save</Button>
  </FormScaffold.Actions>
  <FormScaffold.Footer>
    <FormConfigFooter config={footerConfig} />
  </FormScaffold.Footer>
</FormScaffold>
```

Slot order is fixed and mandatory. Slots must not be merged or repurposed.

---

## Business Rules System

- `RuleEngine.check()` — pure orchestration, returns allow/block result
- `RuleGate` — conditional render wrapper, emits result only (parent owns all UX)
- `useRuleCheck` — hook for complex UI (warnings, modals, progress)
- Fail-open by design — backend is authoritative

Stable enforcer types: `LIMIT`, `VERIFICATION`, `FEATURE`, `COMPLIANCE`

---

## Scripts

- `./trkc-launch.sh dev` — Start the dev server
- `./trkc-launch.sh prod` — Build and serve the preview build
- `./trkc-launch.sh typecheck` — `tsc -b` across app, node and test projects
- `./trkc-launch.sh unit` — Unit tests
- `./trkc-launch.sh integration` — Integration tests
- `./trkc-launch.sh lint` — Lint with fix (requires the dev container running)
- `./trkc-launch.sh docker` — Rebuild the image after a `package.json` change

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript 5 |
| Build | Vite |
| Design System | Material-UI v7 |
| Server State | Dexie domain stores + RxJS |
| Forms | React Hook Form v7 + Yup |
| Routing | React Router v7 |
| i18n | i18next |
| Testing | Vitest + Testing Library |

---

## Environment

- **Node.js 20+** required
- Configure backend API URL in `.env` (see `.env.example`)
- All env vars must use the `VITE_` prefix

---

## API Contract

All data flows through the `dataService` abstraction — never call HTTP directly from domain code.

- All responses follow `ApiResponse<T>`
- 4xx/5xx are never thrown — handled as logical errors via `response.error`
- Transport exceptions are caught by `safeApiResponse`
- App logic checks `error.key`, not HTTP status codes

---

## License

Private — Not open source.

---
