# rtk-entity-updater

A dev-time code generator that keeps RTK Query cache in sync when entities are updated or deleted outside of a query re-fetch.

The generator reads your RTK Query API file, walks the TypeScript types to discover every entity and where it can appear in query responses, and emits a typed helper file. At runtime those helpers find every copy of an entity across all active cache entries and patch or remove it in one dispatch.

## How it works

**At build time** you run the generator once (or whenever the API changes). It outputs two files into your project:

- `generated/exampleApi.ts` — typed `updateEntity`, `deleteEntity`, and `setupMutationListeners` functions bound to your specific entities and query shapes; also exports `reducerPath` detected from your API definition
- `generated/utils.ts` — the runtime traversal engine (copied verbatim; not bundled into the library itself)

**At runtime** `updateEntity` and `deleteEntity` dispatch Redux thunks that traverse the RTK Query cache using the pre-computed shape maps and patch every matching occurrence via Immer. `setupMutationListeners` wires up RTK Query listener middleware to do this automatically after PATCH/PUT mutations complete.

## Installation

```bash
npm install --save-dev rtk-entity-updater
```

Peer dependencies: `@reduxjs/toolkit`, `immer`, `typescript`.

## Usage

### 1. Generate the helper file

Call `generate` from a script (e.g. `scripts/generateApi.ts`) and point it at your RTK Query API file:

```ts
import { generate } from 'rtk-entity-updater';

await generate('./src/store/exampleApi.ts', './src/store/generated/exampleApi.ts');
```

Add it as an npm script:

```json
"scripts": {
  "generate": "tsx scripts/generateApi.ts"
}
```

Run it whenever your API types change:

```bash
npm run generate
```

### 2. Wrap the API reducer

In your store setup, wrap the RTK Query reducer so it can handle the cache-patch actions:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { exampleApi } from './exampleApi';
import { wrapApiReducer } from './generated/utils';

export const store = configureStore({
  reducer: {
    [exampleApi.reducerPath]: wrapApiReducer(exampleApi.reducer),
  },
  middleware: (getDefault) => getDefault().concat(exampleApi.middleware),
});
```

### 3. Set up mutation listeners (optional)

If you want PATCH/PUT mutations to automatically sync the cache on success, add listener middleware and call `setupMutationListeners`:

```ts
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { exampleApi } from './exampleApi';
import { setupMutationListeners } from './generated/exampleApi';
import { wrapApiReducer } from './generated/utils';

const listenerMiddleware = createListenerMiddleware();
setupMutationListeners(listenerMiddleware, exampleApi);

export const store = configureStore({
  reducer: {
    [exampleApi.reducerPath]: wrapApiReducer(exampleApi.reducer),
  },
  middleware: (getDefault) =>
    getDefault().concat(exampleApi.middleware, listenerMiddleware.middleware),
});
```

### 4. Update and delete entities

Dispatch the generated thunks anywhere you have access to the Redux store:

```ts
import { updateEntity, deleteEntity } from './generated/exampleApi';

// updater is typed as (entity: Draft<User>) => void — no casting needed
store.dispatch(updateEntity('User', userId, (user) => {
  user.displayName = 'New Name';
}));

store.dispatch(deleteEntity('Comment', commentId));
```

Both functions find every copy of the entity across all active query cache entries and apply the change atomically, so list queries, detail queries, and nested occurrences (e.g. a `User` embedded in a `Repository.owner` field) all stay consistent.

## Entity detection

The generator identifies an entity type by these criteria:

- It is a named TypeScript `type` alias (not an inline object or interface)
- It resolves to a non-array object with at least one property
- It has a field whose normalized name (lowercased, non-alpha stripped) is `id` or `{TypeName}id`

Only PATCH and PUT mutations are included in the auto-sync map. POST mutations create new entities and don't update existing cache entries.

## Generated file shape

```ts
// Typed overloads — entityType and updater callback are strictly typed per entity
export function updateEntity(entityType: 'User', id: string | number, updater: (entity: Draft<User>) => void): ...;
export function updateEntity(entityType: 'Post', id: string | number, updater: (entity: Draft<Post>) => void): ...;
// ...

export function deleteEntity(entityType: 'User', id: string | number): ...;
// ...

// reducerPath detected from your createApi / injectEndpoints call
export const reducerPath = 'api' as const;
```

## Requirements

- TypeScript 5+
- `@reduxjs/toolkit` 2+
- `immer` 9+