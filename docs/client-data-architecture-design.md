# Client Data Architecture

**Updated:** 2026-10-12
**Status:** Description of the implemented frontend data pipeline.

## 0. How to use this document

Behavioral rules and working reference paths live in
[the domain data guidance](../src/services/domain/CLAUDE.md) and
[the DataStore lifecycle guidance](../src/services/dataStore/CLAUDE.md).
This document explains the architecture and its rationale. It is not a backlog or a list
of backend changes still required. Source paths below are relative to `src/`.

The implemented foundation includes normalized Dexie storage, recursive shredding,
association-aware joins, persistent scope tracking, the hook adapter, reference-data
projections, and realtime dirty/recovery handling. Company, Partnership, Location,
LocationAddress, and InventoryType provide concrete relationship examples. The company
trash page exists. TanStack is absent from `src` and `package.json`.

This does not imply that every product domain or screen is complete. For example,
`companyProfile.service.ts` still supplies mocked commercial metrics and supply data.

## 1. Why the store is entity-keyed

An entity may arrive through several endpoints: a company list, a partnership's included
company, or another relationship. Storing each response as an independent query result
creates duplicate copies and requires cross-query invalidation to keep them consistent.

The current store holds one record per model and ID. Included entities populate their own
tables, so another screen or relationship reads the same stored record. Reactive reads
propagate changes without query-cache invalidation.

Manufacturing traceability requires walking relationships in both directions and through
multiple models. Foreign-key indexes provide those hops without retaining duplicated
nested response trees. Persistent storage also avoids discarding unchanged records on
browser refresh. Completeness and freshness remain separate questions, handled by scope.

## 2. Implemented architecture

### 2.1 Layers and responsibilities

| Layer | Responsibility |
|---|---|
| Hooks / UI | Subscribe, render, and report intent |
| Domain Service / `createDomainStore` | REST paths, includes, request state, scope, composition, and write lifecycle |
| DataStore | Normalized entity persistence and reactive local queries |
| DataService | Uncached REST transport through ApiService |
| Shredder | Generic response-tree normalization and guarded entity writes |
| ApiService | HTTP verbs, authentication transport, and token handling |

`dataService.ts` binds the public transport to `httpDataService`. It does not invoke the
shredder. `createDomainStore.ts` calls the shared shredder after successful REST responses;
reference loaders also use the shredder to populate the store.

Dawnshard remains authoritative for authorization, business rules, and validation.
The client does not derive mutation consequences from the association graph.

### 2.2 Read flow

1. A domain observer returns a `DataQuerySource` immediately: data stream, request-state
   stream, and applicable refetch/refresh actions.
2. Its domain store checks whether the requested scope is satisfied.
3. A satisfied scope serves local data. Otherwise the store fetches through DataService.
4. Responses are shredded into model tables; requested include scopes are confirmed.
5. Collection fetching continues through all pages before confirming the root scope.
6. The same data stream emits the updated, explicitly composed shape.

`observeAll`, `observeWhere`, and `observeById` apply the domain's `compose` callback.
`observeById` composes a collection of one and then selects its first row. Collection
observation is shared for the session by `createDomainStore`.

A network failure is reported through request state without clearing held data.
Store subscription failures are handled separately by `useDataQuery`.

### 2.3 Write flow, deletion, and restore

Create, update, and custom mutation requests go through REST. Successful mutation
responses are shredded with mutation semantics; a failed store write propagates to the
caller. The client does not optimistically patch entities.

Delete and restore use the `DeleteRestoreResult` contract in `createDomainStore.ts`:

```ts
records: {
    primary: Array<{ modelName: string; ids: string[] }>;
    related: Array<{ modelName: string; ids: string[] }>;
}
```

The server reports both sets. `primary` contains directly affected records, including
cascaded dependants. `related` contains surviving records changed as a side effect.

For deletion, the domain store tombstones every primary ID before removing records and
clearing their record scopes. Related records are marked dirty, not removed or tombstoned.
For restore, it clears primary tombstones, refetches the root, and marks other affected
model scopes dirty for authoritative reads.

Tombstones protect against older in-flight responses resurrecting removed rows. They live
in memory, expire according to the configured HTTP timeout, and are checked again after
reading stored records immediately before writing. This is distinct from trash handling:
the company trash view reads deleted records directly from HTTP, outside the domain store.

### 2.4 Eager REST includes

Domains declare independent `collectionIncludes` and `recordIncludes`. A detail read
does not inherit the collection's include list. Includes load related records in the
same REST response; shredding distributes those records to their model tables.

Loading an include, storing its entities, confirming its completeness, and composing a
consumer-facing shape are separate operations. An include alone does not reconstruct
nested relationships on subsequent local reads.

### 2.5 The graph is the foreign keys

`ModelRegistry` holds backend association descriptors keyed by response alias, including
association type, target model, and resolved foreign key. Dexie derives FK indexes from
those descriptors. The shredder uses them to follow response relationships; joins use
them to validate edges and determine target models.

A relationship hop is an indexed lookup:

- Partnership → Company: match `Partnership.companyId` to `Company.id`.
- Company → Locations: query Location by `companyId`.
- Location → LocationAddress: query LocationAddress by `locationId`.
- LocationAddress → Address: match `addressId` to Address's ID.
- InventoryType → OilProperty: query OilProperty by `inventoryTypeId`.

Any-depth traversal is a sequence of such lookups. The graph is available; there is no
requirement to retain a nested response tree to traverse it. Whether a hop needs REST
is decided by scope completeness, not merely by the presence of some matching entities.

#### Composition and joins

Domain services declare their consumer-facing shape through `createDomainStore.compose`.
The callback runs when observations are built, after model definitions have loaded.

| Helper | FK location | Result |
|---|---|---|
| `joinOne` | Source row, `belongsTo` | Target record or `undefined` |
| `joinMany` | Target row, `hasMany` or `hasOne` | Array of matching targets |
| `joinHasOne` | Target row, `hasOne` | First matching target or `undefined` |
| `joinThrough` | Junction row, `belongsToMany` | Array of linked target ids |

Every helper names its edge by association alias, and reads the foreign key from that
edge's descriptor. A foreign key cannot identify an edge: InventoryType's id is the key of
its `oilProperty`, `soapAdditiveEffect`, `recipeType` and `materialGroup` edges alike.

The helpers validate the requested edge eagerly. They observe DataStore records directly
and re-emit when either observed side changes. They do not call target domain services,
inherit a target's `compose` callback, or recursively reconstruct its associations.
A TypeScript target type does not change this behavior.

Nested relationships already work through explicit composition and successive domain
queries. The company profile queries locations by company, then location-address records
by location IDs and groups them for display. Location composes LocationType; LocationAddress
composes Address and AddressType. Partnership separately composes Company.

InventoryType's service composes OilProperty using `joinHasOne`. The FK is
`OilProperty.inventoryTypeId`; InventoryType has no `oilPropertyId`. A direct `joinOne`
lookup of InventoryType returns the flat record, bypassing that service's composition.
This is the helper's contract, not evidence that multi-hop traversal is unsupported.

### 2.6 Entities and scope

Entities answer what is held. Scope answers whether it is complete for a requested
server filter. Neither completeness nor in-flight request state is inferred from rows.

`scope.ts` persists canonical filter keys alongside entities. Its stored states are
`satisfied` and `dirty`; an absent or non-covering scope is unsatisfied. Equality,
`anyOf`, and ranges can be compared for subset coverage. Unsupported comparisons fall
through to fetching rather than claiming completeness.

The local DataStore `Where` supports equality and `anyOf` over indexed fields. It is
separate from `ScopeFilter`, which describes the server request and is compared rather
than evaluated by Dexie. `useCollection` owns view search, filtering, sorting, and paging.

Collection fetches request `includeMeta`, page while `meta.hasMore` is true, and confirm
the root scope only after applying the pages. The request tracker owns fetch/error state.

`includeScope.ts` parses dotted include paths and recursively confirms the returned
edges against association metadata. An absent response alias does not confirm an edge.
Returned empty relationships can establish completeness without children to recurse into.
Scope confirmation runs after shredding, so completeness does not precede stored data.

### 2.7 Shredding and record integrity

`services/dataService/shredder.ts` recursively walks declared association aliases, removes
nested relationships from parent records, and buckets entities by model and ID.
Many-to-many join-row aliases are handled using descriptor metadata.

The shared implementation:

- Skips ID-only stubs so they cannot overwrite fuller records.
- Replaces stored records rather than merging partial response fields.
- Rejects incoming records older than the held `updatedAt`, when both timestamps exist.
- Rejects tombstoned IDs and serializes shredding to protect read/write ordering.
- Reports write failures; mutation writes propagate failures to the caller.

There is no system-owner/bootstrap-only write guard in the current shredder. It does not
re-decide authorization: the server has already authorized and shaped the response.

Replace-on-read requires whole-record responses. Projected search or list fragments must
not be fed into this store as complete entities. The ID-only stub check does not protect
against a partial record containing several fields.

### 2.8 Persistence and lifecycle

`dataStore.dexie.ts` creates one table per loaded model plus the scope table. Tables are
keyed by ID and indexed using association metadata; field validation remains outside Dexie.

The database is profile-scoped and named using a hash of model definitions. A changed
model shape selects a new database; stale names are swept using a local database index.
No separate model-to-Dexie field validation schema or migration layer is needed.

Browser refresh retains the database. Only `endSession()` may destroy it, on login/logout.
Login is cold. Session teardown disconnects reference projections and realtime before
store destruction. A cross-tab broadcast closes sibling connections so IndexedDB deletion
can complete; tabs share the same profile database on an origin.

Tests use `fake-indexeddb` with the real adapter rather than a second in-memory store.

### 2.9 Bootstrap and reference projections

Pre-auth loads configuration, i18n, and public model definitions without opening the store.
`initialiseSession.ts` runs the post-login loaders sequentially:

1. Full model definitions.
2. Profile-scoped DataStore.
3. Authenticated Identity.
4. Realtime connection and recovery handling.
5. TypeRegistry, StateRegistry, and rules.

TypeRegistry and StateRegistry are synchronous projections over stored reference entities.
Their Maps support render-time lookups without a hook and loading state for every cell.
`services/domain/projection.ts` manages their subscriptions and readiness.

Config, i18n bundles, and the business-rule bundle stay outside entity storage. RuleRegistry
keeps its own bundle loading; it is not a stored-entity projection. Model definitions also
stay outside the database because they define its tables and indexes.

### 2.10 Domain surface

`createDomainStore` provides observation, fetching, create/update/custom mutation,
soft/hard deletion, restore, and refresh. Domains supply path, model, includes, and
composition. Specialized relationship methods delegate to `observeWhere` with both a
local query and the server scope filter.

The library ports keep domains independent of Dexie and HTTP implementation details.
Domain screens reuse this surface rather than inventing endpoint or persistence machinery.

### 2.11 Hook state

`services/domain/useDataQuery.ts` combines a data stream with a request-state stream.
It exposes `data`, `isLoading`, `isFetching`, `isError`, `error`, `refetch`, and `refresh`.

An enabled query is loading while the store has not answered, or while an empty answer has
a fetch in flight. Held rows remain visible during background fetching. A settled empty
collection renders the empty state. A disabled source stays idle. Fetch failures retain
held data; store stream failures are surfaced separately as errors.

### 2.12 Realtime change notification

`RealtimeLoader`, `services/realtime/realtime.socketio.ts`, `realtimeQueue.ts`, and
`services/domain/realtimeSync.ts` implement live dirty delivery, recovery, and acknowledgment.
Socket.IO carries signals, never authoritative record content. REST still supplies entities.

Dirty batches contain `modelName`, `op`, optional `instigatorId`, and records containing
ID and an optional comparison timestamp. Live and recovered batches enter the same queue.
The queue retains record order and pending generations while applying local dirty state.
Acknowledgment means that dirty state has been recorded, not that a REST refetch finished.

Removal signals tombstone and remove the named records; restore signals clear tombstones.
Changes mark held model scopes dirty. Domain observers reconcile through their normal REST
fetch path rather than interpreting socket payloads as entity updates.

Recovery runs on every successful connection, including the initial connection. It returns
`bootId`, `stale`, and outstanding updates. A stale response or mismatched server boot ID
marks all held scopes dirty; otherwise returned batches follow the live-delivery path.
The frontend persists the last server boot ID across refreshes and clears it at session end.
The protocol uses recovery rather than a durable cursor/event-log replay path.

### 2.13 Public boundaries

ApiService owns HTTP mechanics. DataService owns uncached transport. DataStore owns local
persistence and reactivity. Domain services own consumer-facing relationships and request
policy. `useCollection` receives arrays and owns view transformations.

Reference registries retain synchronous public lookup APIs while their entity data is
maintained by projections. The rule bundle remains a separate advisory frontend concern.

### 2.14 Third-party isolation

Dexie is confined to `dataStore.dexie.ts`; Socket.IO is confined to
`realtime.socketio.ts`. The DataStore port exposes `Stream<T>` rather than requiring domain
signatures to name RxJS. Shared reactive infrastructure includes joins, domain-store
orchestration, request state, and the adapter.

`eslint.config.js` defines the actual restricted imports and implementation exceptions.
Ports must not expose database handles, engine collections, or transport instances.

## 3. Implementation map

| File or area | Responsibility |
|---|---|
| `core/models/ModelRegistry.ts` | Backend definitions and association descriptors |
| `services/dataService/dataService.ts` | Uncached HTTP binding |
| `services/dataService/shredder.ts` | Recursive normalization and write guards |
| `services/dataStore/dataStore.types.ts` | Storage and stream port |
| `services/dataStore/dataStore.dexie.ts` | IndexedDB adapter and lifecycle |
| `services/domain/createDomainStore.ts` | Domain reads/writes, composition, and scope orchestration |
| `services/domain/joins.ts` | Validated reactive relationship joins |
| `services/domain/includeScope.ts` | Recursive include completeness confirmation |
| `services/domain/scope.ts` | Persistent coverage and dirty state |
| `services/domain/requestState.ts` | Fetch state tracking |
| `services/domain/useDataQuery.ts` | React subscription and request-state adapter |
| `services/domain/projection.ts` | Reference projection lifecycle |
| `core/bootstrap/initialiseSession.ts` | Ordered initialization and session teardown |
| `core/bootstrap/loaders/RealtimeLoader.ts` | Connection/recovery orchestration |
| `services/realtime/` | Transport, dirty queue, acknowledgment, and presentation signals |
| `services/domain/realtimeSync.ts` | Dirty signals applied to local lifecycle and scope |

Working domain examples are listed in the directory guidance linked in section 0.
There is no remaining TanStack migration checklist in this document. Backend behavior is
consumed through current model, REST, delete/restore, and realtime contracts; this document
does not assert an unverified backend implementation backlog.
