# @slate-yjs/react

## 0.3.0

### Minor Changes

- [#363](https://github.com/BitPhinix/slate-yjs/pull/363) [`3710c48`](https://github.com/BitPhinix/slate-yjs/commit/3710c4887ee89946ace787ba24436d82d95bc856) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Changed:

  - Rewrite of `useRemoteCursorOverlayPositions` to provide stricter typings, make it react 18 safe and add new `shouldGenerateOverlay` option.

  Added:

  - Remote cursor decorations using the new `useDecorateRemoteCursors` hook
  - Remote cursor data hooks `useRemoteCursorStatesSelector` and `useRemoteCursorStates`
  - Utility hooks to un-send the current cursor position on window/editor blur: `useUnsetCursorPositionOnBlur`
  - `getCursorRange` helper

### Patch Changes

- Updated dependencies [[`3710c48`](https://github.com/BitPhinix/slate-yjs/commit/3710c4887ee89946ace787ba24436d82d95bc856)]:
  - @slate-yjs/core@0.3.0

## 0.2.4

### Patch Changes

- [#339](https://github.com/BitPhinix/slate-yjs/pull/339) [`042a0a2`](https://github.com/BitPhinix/slate-yjs/commit/042a0a22f57ed7542a4e05840532f16d37629e33) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Replace workspace:^ dependencies with concrete version range

## 0.2.3

### Patch Changes

- Updated dependencies [[`5172e4a`](https://github.com/BitPhinix/slate-yjs/commit/5172e4a0033db41bc3530f227c5371e9ddb22269)]:
  - @slate-yjs/core@0.2.3
