## PURPOSE
This file defines **non-negotiable architectural and behavioral constraints**.
Claude must **enforce**, not explain.
If uncertain, **fail closed** and ask.


## ABSOLUTE RULES (VIOLATIONS = WRONG)

### 1. Third-Party Isolation
- ❌ Never import third-party libraries in app code
- ✅ App code uses `src/services/*` only
- Libraries are hidden behind service interfaces
- Swapping libraries must touch **one file only**

### 2. Configuration
- ❌ No scattered configuration
- ✅ All configuration lives in `src/config/*`
- Runtime access via `getConfig()` only
- Precedence: **UserPreferences > localStorage > config defaults**

### 3. Business Logic Separation
- ❌ No library logic in domains/components
- ❌ No UI logic in services
- ❌ No policy/rule logic in UI
- ✅ Strict layer boundaries at all times

### 4. Convention Over Cleverness
- Consistency is mandatory
- Explicit > abstract
- Predictable > “smart”


## UI ARCHITECTURE (MANDATORY)

### 3-Layer UI Stack (DO NOT BREAK)
App code
→ components/ui/
→ theme-elements/
→ @mui/material

**Hard rules**
- ❌ App code must NOT import `@mui/material`
- ❌ App code must NOT import `theme-elements`
- ✅ App code imports ONLY from `components/ui`

### Type Flow (REQUIRED)
- MUI types → re-exported by `theme-elements`
- `theme-elements` types → re-exported by `components/ui`
- App code must never reference MUI types directly


## COMPONENT CREATION RULES

When adding UI components:
1. Check Modernize source first
2. If a styled version exists → follow that pattern
3. Else → passthrough wrapper only
4. Always re-export types
5. Always update barrel exports

Any missing step = invalid implementation.


## CONTEXT SYSTEM (IMPORT RULES)

### Circular Dependency Prevention

**CRITICAL:** Hydration functions must NOT be re-exported from `core/context/index.ts`.

❌ **Wrong pattern (creates circular chunks)**
```typescript
// core/context/index.ts
export { hydrateFromAuthContext } from './hydration/hydrateFromAuthContext';

// ContextDefaults.tsx
import { hydrateFromAuthContext } from '@/core/context'; // ← CIRCULAR
import { useProfile } from '@/core/context'; // ← Same barrel, creates cycle
```

✅ **Correct pattern**
```typescript
// ContextDefaults.tsx
import { hydrateFromAuthContext } from '@/core/context/hydration/hydrateFromAuthContext'; // ← Direct import
import { useProfile } from '@/core/context'; // ← Barrel OK (no cycle)
```

**Rule:** Hydration functions are implementation details. Import directly from `/hydration/*.ts` modules, never from barrel.

**Watch for:** `circular chunk` warnings in `npm run build` output. Always resolve before shipping.


## BOOTSTRAP SYSTEM

For client data and relationship reads, first read
[src/services/domain/CLAUDE.md](src/services/domain/CLAUDE.md) and
[src/services/dataStore/CLAUDE.md](src/services/dataStore/CLAUDE.md).
These document the implemented association traversal and composition contract. The detailed
architecture is in `docs/client-data-architecture-design.md`.

- Bootstrap runs **before render**
- Critical loaders block startup
- Non-critical loaders must fail gracefully
- No runtime re-bootstrap

Critical loaders include:
- Config
- Models
- I18n
- Rules


## RULE SYSTEM (FRONTEND)

### Principles
- Frontend rules are **advisory only**
- Backend is authoritative
- Fail open
- No UI decisions in rule engine
- No thresholds in rule engine

### Structure
- `RuleEngine` = orchestration only
- Checkers = pure functions
- `useRuleCheck` = emits results; parent owns presentation
- `RuleGate` = simple allowed/blocked child rendering with a loading fallback
- Parent component owns all UX

### Stable Enforcers
- LIMIT
- VERIFICATION
- FEATURE
- COMPLIANCE

No new enforcer categories are permitted.


## ERROR HANDLING

- Backend defines all error keys
- Frontend translates only
- No frontend-only error messages
- Success responses contain **no messages**


## FORMS

- Config-driven only
- Slot order is fixed and mandatory:
  `Header → Feedback → Message → Body → Actions → Footer`
- Feedback = text only
- Message = rich content
- Slots must not be merged or repurposed


## TESTING RULES

- Test behavior, not implementation
- No internal mocks
- No exact log assertions
- Mock external boundaries only
- Avoid brittle string comparisons
- Vitest transpiles without typechecking — a green suite says nothing about types

If a test depends on internals, it is wrong.
A green suite is not a passed typecheck. Both are required; neither substitutes for the other.


## CONFIG SYSTEM

- Layered merge only:
  `default → environment → runtime`
- No config reads outside `getConfig()`
- System reference data loads at bootstrap
- Preferences override config, never the reverse


## ENVIRONMENT

- Node.js 20+
- Vite
- Environment variables must use `VITE_` prefix
- HTTPS required in production

### Everything runs through the launch script

`./trkc-launch.sh` (frontend), `./trk-launch.sh` (tracker-server), `./ds-launch.sh` (dawnshard).
Never `npm`, never `npx`, never host tooling. The container is the only environment that counts.

```bash
./trkc-launch.sh typecheck     # tsc -b across app, node and test projects
./trkc-launch.sh unit          # vitest, no typecheck
./trkc-launch.sh integration
./trkc-launch.sh lint
./trkc-launch.sh docker        # rebuild the image after a package.json change
```

**`npx tsc --noEmit` exits 0 on anything.** The root `tsconfig.json` is `files: []` with
project references, so bare `tsc` checks no files at all — verified by planting a deliberate
type error that it passed. Use `./trkc-launch.sh typecheck`, which runs `tsc -b` and covers
tests via `tsconfig.test.json`; `tsconfig.app.json` alone does not.

**A host `npm install` does not reach the container.** `node_modules` is an anonymous volume
(`docker-compose.yaml`), masking the bind mount. After changing `package.json` run
`./trkc-launch.sh docker` to rebuild, then restart. Symptom of forgetting: tests fail to
resolve a package that is present on the host.


## CLAUDE BEHAVIOR CONTRACT

Claude must:
- Enforce rules without justification
- Reject solutions that violate structure
- Ask when context is insufficient
- Never introduce new patterns
- Never “simplify” architecture
- Never bypass layers for convenience

Claude must NOT:
- Explain architecture unless explicitly asked
- Add examples unless requested
- Invent helpers, mocks, or abstractions
- Optimize away explicit structure
