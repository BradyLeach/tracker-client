# DataStore

Read [../domain/CLAUDE.md](../domain/CLAUDE.md) for association traversal, composition,
includes, and scope ownership. Dexie stores flat entities and indexes their foreign keys;
its observers do not automatically reconstruct nested associations. The model registry
retains the association descriptors used for indexing, shredding, and join validation.

The store persists across refreshes and across tabs. Offline-first depends on it.

Only `endSession()` (login and logout) may call `dataStore.destroy()`. It closes the store in
every tab on the origin and deletes the database. Calling it anywhere else, including bootstrap
or a loader, makes every refresh cold and drops the store out from under every other open tab.
