# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # tsc type-check + vite library build → dist/
npm run lint         # eslint + tsc --noEmit
npm test             # jest (all tests)
npm test -- --testPathPattern=findEntity   # run a single test file by name
npm run generate     # run the code generator via esbuild-runner
```

## What this is

A dev-only library with two distinct parts:

**Code generator** (`src/scripts/`, library entry: `src/index.ts`): Consumes an RTK Query API TypeScript file, uses the TypeScript compiler API to walk endpoint return types, and emits a static `.ts` file with pre-computed maps plus typed wrappers around the runtime utilities.

**Runtime utilities** (`src/assets/utils.ts`): Copied verbatim into the consumer's project by the generator. Contains the Redux reducer wrapper, `findEntityGenerator`, and thunk creators for `updateEntity`/`deleteEntity`. This file is **not bundled** — it is written to disk next to the generated output file at code-generation time.

## Code generation pipeline

`generateTypeSchema(apiFilePath, outputFilePath)`:
1. `loadFile` creates a TypeScript `Program` + `TypeChecker` from the API file.
2. `findQueries` / `findMutations` walk the source AST for RTK Query endpoint type annotations.
3. For each endpoint, `collectEntityTypes` recursively walks the return type and collects every type that passes `isEntityType`.
4. `describeShape` converts each type into a **shape value**: `"EntityName"`, `"EntityName[]"`, or `Record<field, shapeString>`.
5. Four exports are serialized into the output file: `queryMap`, `mutationsMap`, `entityIdFields`, `entityQueries`, plus typed wrappers that call the runtime utils with these static maps.

### Entity type detection

A TypeScript type qualifies as an entity if it:
- Has a named **type alias** (`aliasSymbol` present)
- Resolves to a non-array object type with at least one property
- Has a field whose normalized name (strip `[^a-z]`, lowercase) equals `"id"` or `"{TypeName}id"`

Exact `id` field takes priority over `{TypeName}Id`-suffix fields.

### Shape strings

The generated `queryMap` maps endpoint names and entity names to shapes:
- `"User"` — value at this position is a User entity
- `"User[]"` — value is an array of User entities
- `Record<string, string>` — object; each entry maps a field name to a shape string for that field

Only `patch*` and `put*` mutations are included in `mutationsMap` — POST mutations create new entities and don't need to update existing cache entries.

## Runtime: `findEntityGenerator`

A `Generator<void>` doing a **stack-based depth-first traversal** of the RTK Query `queries` slice, guided by `queryMap` shapes. Key behaviors:
- Only visits endpoints listed in `entityQueries[typeName]` (pre-filtered at generate time)
- Yields after every 1000 iterations when the time budget has elapsed, so `promisifyGenerator` can reschedule via `requestIdleCallback`
- Returns key paths (`(string | number)[][]`) pointing to every cache location where the target entity appears

`wrapApiReducer` wraps the RTK Query reducer and handles two custom action types — `api/queries/entitiesUpdated` and `api/queries/entitiesDeleted` — that write/remove at discovered key paths using Immer.

## Tests

Tests live in `test/` and run with Jest + Babel. They import directly from **already-generated** files committed to the repo as fixtures:
- `src/store/generated/productApi.ts` — generated output (queryMap, entityIdFields, etc.)
- `src/store/generated/utils.ts` — copy of `src/assets/utils.ts`

`requestIdleCallback` is not available in Node; every test file mocks it in `beforeEach` with a microtask-based stub.

Test files: `findEntity.test.ts`, `updateEntity.test.ts`, `deleteEntity.test.ts`, `mutationListeners.test.ts`. Mock data in `test/mockData.ts` includes deliberately nested entities (e.g. `User.followers: User[]`) to exercise deep traversal.

## Build

Vite builds in library mode (ES + CJS). `typescript` and `prettier` are external — not bundled. `tsconfig.app.json` scopes compilation to `src/index.ts` and `src/scripts/` only; the browser demo files (`main.tsx`, `App.tsx`, `store/`, `server/`) are excluded.