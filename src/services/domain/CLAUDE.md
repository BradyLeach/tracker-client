# Client data and association composition

This is the implemented architecture. Read this before changing domain stores, joins,
include handling, or relationship reads. Read `../dataStore/CLAUDE.md` for store lifecycle.

## Ownership and read flow

- `ModelRegistry` holds backend model definitions, including association aliases, targets,
  types, and foreign keys. Dexie generates indexes from those descriptors.
- `dataService` is uncached HTTP transport. `createDomainStore` fetches through it, invokes
  the shredder, and confirms scope after records have been written.
- The shredder recursively follows declared associations in responses and writes flat
  records into each model's table. Nested objects are not retained on parent records.
- Dexie observers return flat records. Foreign keys are the graph edges; traversal at
  any depth is a sequence of indexed lookups, in either direction.
- Domain services declare the shape consumers need through `createDomainStore.compose`.
  The callback applies to `observeAll`, `observeWhere`, and `observeById`. Declare joins
  inside that callback; edge validation is eager when a join is called.

## Join behavior

- Every join names its edge by association alias, never by foreign key. A foreign key can
  serve several edges of one model; matching on it picks whichever is declared first.
- `joinOne`: source holds the FK (`belongsTo`); attaches the target by ID.
- `joinMany`: target holds the FK (`hasMany` or `hasOne`); attaches matching targets.
- `joinHasOne`: target holds the FK (`hasOne`); attaches the first matching target.
- `joinThrough`: a `belongsToMany` through its `via` junction model; attaches the linked
  target ids. The junction rows are the link and arrive nested in the include response.
- Helpers resolve the target through association metadata and observe flat DataStore
  records directly. They do not call target domain services or inherit their `compose`
  callbacks. Type parameters do not hydrate additional relationships.
- Joins re-emit when either observed side changes. Missing singles are `undefined`;
  missing collections are empty arrays.

## Nested relationships already work

Do not treat a flat record returned by `joinOne` as evidence that the pipeline cannot
resolve nested relationships. Explicit composition and successive domain queries already
support multiple hops. Automatic recursive reconstruction is not the current read contract.
Follow the existing implementation before proposing changes to the shared pipeline.

Reference paths:

- `domains/business/partnership/services/partnership.service.ts` composes Company onto
  Partnership with `joinOne`.
- `domains/business/pages/PageCompanies.tsx` groups separately observed partnerships by
  company ID.
- `domains/business/pages/PageCompanyProfile.tsx` observes locations by company, then
  location-address relationships by location IDs, and groups them for rendering.
- `domains/business/location/services/location.service.ts` composes LocationType.
- `domains/business/locationAddress/services/locationAddress.service.ts` composes Address
  and AddressType with two joins.

These paths are relative to `src/`.

## Includes are loading and completeness, not composition

`collectionIncludes` and `recordIncludes` are independent REST include sets.
`includeScope.ts` walks requested dotted include paths against association metadata and
confirms the returned edge scopes recursively. This allows later domain traversals to
read locally when their scopes are satisfied. It does not reconstruct nested read shapes.
Requesting an include, storing its records, confirming its scope, and composing its shape
are separate operations.

## Detailed architecture

The detailed architecture is `docs/client-data-architecture-design.md`
(relative to the repository root). It describes the implemented pipeline and its rationale;
section 2.5 covers FK traversal and domain composition. This directory guidance is the
behavioral contract for implementation work.
