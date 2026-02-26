---
'@getguru/slate-yjs-core': patch
---

Fix crash when applying Yjs update with invalid Slate path. When Yjs and Slate get out of sync (e.g. after paste/duplication), the editor now recovers by re-syncing from Yjs instead of throwing "Cannot find a descendant at path".
