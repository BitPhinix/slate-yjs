# Flush-path sync-skew recovery

**Date:** 2026-05-20
**Status:** Approved design, pre-implementation
**Tracking:** sc-154363 ("Unable to load Card content" persistent error blocks card creation)
**Package:** `@getguru/slate-yjs-core` (this repo)

## Problem

Users intermittently hit an uncaught error while editing — most visibly
`Error: Path doesn't match yText, yTarget spans multiple nodes` — which the
consuming app (guru-ui) catches in its editor `errorPlugin` and surfaces as
"Unable to load Card content", forcing a page refresh and losing unsaved work.
In one reported session the error fired three times in a few minutes.

### Root of the crash (in this library)

`getYTarget` (`utils/location.ts`) throws when a Slate path's computed Y-offset
slice resolves to more than one Y node — i.e. the local Slate tree has diverged
structurally from `Y.XmlText`. `getYTarget` is called **only on the
`applyToYjs` side** (local Slate → Y), via `applySlateOp` inside
`YjsEditor.flushLocalChanges` (`plugins/withYjs.ts`).

`flushLocalChanges` has **no error handling**:

1. It deletes `LOCAL_CHANGES` up front, then applies queued ops inside
   `sharedRoot.doc.transact(...)`.
2. If `applySlateOp` throws mid-flush, the throw propagates out through
   `e.onChange` uncaught; remaining ops in the batch are dropped and Yjs keeps
   any partial mutation already committed in that transaction.
3. Slate is left **permanently ahead of Y**, so every subsequent op re-skews
   and re-throws — hence the repeated "3× in a few minutes".

### What already exists

The fork already recovers from the *same error class* in the **opposite
direction**:

- `applyToSlate/index.ts → applyYjsEvents`: on `isSyncSkewError`, calls
  `resyncFromYjs(sharedRoot, editor)` (rebuild `editor.children` from Y, restore
  selection), throttled to 1/sec, with a `console.warn`.
- `utils/position.ts`: on `isSyncSkewError`, returns `null` (graceful).

The gap is solely the **local-flush (`applyToYjs`) direction**.

## Goal

Stop the editor from crashing on a flush-time sync-skew by recovering
gracefully, **without masking** that the skew happened (so the upstream root
cause — ungated non-idempotent structural normalization in the consuming app —
remains visible and fixable).

### Non-goals

- Fixing the app-side normalizer branches that *create* the divergence (separate
  defense-in-depth work in guru-ui; this is the library safety net).
- Changing the existing remote-path (`applyYjsEvents`) recovery behavior beyond
  routing its reporting through the new hook.
- Preserving the specific edit that triggered the skew (see Decision 1).

## Decisions

1. **Recovery direction: resync Slate from Y.** Mirror the existing
   `resyncFromYjs` — Y is the source of truth; rebuild `editor.children` from it
   and restore selection where possible. The un-syncable local edit is
   discarded. Rationale: consistent with the existing recovery, collaboration-
   safe (never clobbers concurrent peers), and drafts persist from Y anyway, so
   this matches what is actually saved. Rebuilding Y from Slate was rejected
   (clobbers remote edits, risks propagating malformed structure to peers).

2. **Telemetry: optional `onSyncSkew` hook + `console.warn`.** Once the error is
   caught it no longer throws, so Rollbar (which captured the *uncaught* throw)
   would go blind. Add an optional `onSyncSkew(error, context)` callback to
   `WithYjsOptions`; the app wires it to Rollbar. Library keeps no Rollbar
   dependency. Route **both** recovery directions through it.

3. **Throttling: always resync, throttle only reporting.** On the flush path,
   skipping a resync would leave Slate ahead of Y (silent drift / data loss
   until the throttle window passes), so the resync runs on every skew.
   Throttle only the reporting (`onSyncSkew` + `console.warn`, ~1/sec) so a burst
   doesn't spam Rollbar/console.

## Design

### Components

- **`utils/sync.ts` (new).** Move `resyncFromYjs(sharedRoot, editor)` here from
  `applyToSlate/index.ts` unchanged (it depends only on `convert` + `position`
  utils). Imported by both `applyToSlate` and `withYjs`. Single recovery
  implementation, no duplicated copies.
- **`reportSyncSkew(editor, error, context)` (new; `utils/sync.ts`).** Throttled
  (~1/sec) reporter that invokes the optional `onSyncSkew` hook and
  `console.warn`. One coherent reporting path for both directions.
- **`WithYjsOptions.onSyncSkew?: (error: unknown, context: SyncSkewContext) => void`**
  where `SyncSkewContext = { direction: 'applyToYjs' | 'applyToSlate' }`. Stored
  on the editor in `withYjs`.

### Control flow — guard in `flushLocalChanges`

Wrap the `txGroups.forEach(...)` op-apply loop in `try/catch`:

- **`isSyncSkewError(error)`** → `resyncFromYjs(e.sharedRoot, e)` (always, no
  throttle) to restore Slate = Y, then `reportSyncSkew(e, error, { direction:
  'applyToYjs' })` (throttled), then return — abort the rest of this flush.
- **otherwise** → rethrow (never swallow unrelated bugs).

Consequences that fall out for free:

- `LOCAL_CHANGES` is already cleared at the top of `flushLocalChanges`, so the
  un-syncable edits are dropped — exactly what "resync from Y" wants. No extra
  bookkeeping.
- Yjs finalizes a transaction whose callback throws (commits partial mutations +
  fires observers) before rethrowing, so the `catch` sits around the `transact`
  call and resyncs from Y's resulting state. A partial mutation may remain in Y;
  the editor is still consistent after resync, and this is far better than a
  crash.

### Error handling / re-entrancy

The resync runs *during* `e.onChange → flushLocalChanges`, and `resyncFromYjs`
mutates the editor (`editor.children = …` directly, then
`Editor.normalize({ force: true })` and `Transforms.select`):

- **Re-queuing / recursion:** run the resync under `YjsEditor.withOrigin(e,
  <non-local origin>, …)` (and `Editor.withoutNormalizing` where appropriate) so
  its ops are treated as remote-origin and are not re-stored as local changes
  that flush back into the failing path. `children` is set directly from Y, so
  Slate already equals Y and these ops are effectively no-ops against Y.
- **Recursion guard:** an in-flight flag so a resync triggered inside a flush
  cannot trigger another nested flush-resync; if a skew recurs immediately,
  report once and stop rather than loop.
- **Selectivity:** only `isSyncSkewError` is swallowed; anything else rethrows
  unchanged.

### Testing

Mirror `packages/core/test/syncSkewRecovery.test.ts` (vitest). New cases:

- **Recovers instead of throwing:** seed Slate and `Y.XmlText` into a divergent
  state, apply a local op whose path can't map (induces `yTarget spans multiple
  nodes` in `flushLocalChanges`); assert no throw escapes and `editor.children`
  deep-equals the Y-derived content (Slate == Y).
- **Reporting hook fires with context:** `onSyncSkew` called once with `error`
  and `{ direction: 'applyToYjs' }`.
- **Reporting throttled, resync not:** several skews within 1s → `onSyncSkew` /
  `console.warn` called once, but each skew still resyncs (assert consistency
  after each).
- **Non-skew errors propagate:** an unrelated thrown error is rethrown, not
  swallowed.
- **No regression on the remote path:** existing `applyYjsEvents` recovery tests
  still pass after the `resyncFromYjs` extraction; add one asserting its
  reporting routes through `onSyncSkew` too (`direction: 'applyToSlate'`).
- **Selection preserved where possible:** after resync, a still-valid selection
  is restored (reuses `resyncFromYjs`'s existing logic).

Reuse the divergence-inducing helper from the existing sync-skew test (seed Y,
mutate Slate's `children` out from under it, then apply an op).

## Risks & tradeoffs

- **Lost edit on recovery.** The edit that triggered the skew is reverted to Y's
  state. Accepted: better than a crash + forced refresh that loses everything
  unsaved. Drafts persist from Y, so the reverted state matches what is saved.
- **Partial Y mutation.** A failed op may leave a partial mutation in Y before
  the catch. The editor is consistent after resync; the upstream fix removes the
  source of these ops.
- **Masking the root cause.** Mitigated by Decision 2 — the `onSyncSkew` hook
  keeps occurrences visible in Rollbar so the app-side ungated normalizers still
  get fixed.
- **Resync performance under a pathological loop.** Always-resync could rebuild
  the doc repeatedly if edits keep skewing; bounded in practice because after a
  resync Slate == Y and normal edits apply cleanly. The recursion guard prevents
  a tight nested loop.

## Relationship to the upstream (app-side) fix

This is the **safety net**. The divergence originates in guru-ui from ungated
non-idempotent structural mutations that run on Yjs-bound editors (e.g.
`normalizeLists` void-parent `removeNodes`+`insertNodes`; `normalizeCollapsibleNode`
`moveNodes` and remove+insert branches). Those should still be gated on
`!YjsEditor.isYjsEditor(editor)` as a follow-up; the `onSyncSkew` telemetry is
what keeps that work prioritized.
