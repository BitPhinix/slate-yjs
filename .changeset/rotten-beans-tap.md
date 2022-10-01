---
'@slate-yjs/react': minor
---

Changed:

- Rewrite of `useRemoteCursorOverlayPositions` to provide stricter typings, make it react 18 safe and add new `shouldGenerateOverlay` option.

Added:

- Remote cursor decorations using the new `useDecorateRemoteCursors` hook
- Remote cursor data hooks `useRemoteCursorStatesSelector` and `useRemoteCursorStates`
- Utility hooks to un-send the current cursor position on window/editor blur: `useUnsetCursorPositionOnBlur`
- `getCursorRange` helper
