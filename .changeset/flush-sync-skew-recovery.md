---
"@getguru/slate-yjs-core": patch
---

Recover from sync-skew errors during local flush (`flushLocalChanges` /
`applyToYjs`) instead of letting them crash the editor: catch
`isSyncSkewError` (e.g. "yTarget spans multiple nodes"), resync Slate from Y,
and report via a new optional `onSyncSkew` telemetry hook (also routes the
existing remote-path recovery). (sc-154363)
