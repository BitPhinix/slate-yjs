import { CursorState } from '@slate-yjs/core';
import { useCallback, useRef } from 'react';
import { BaseRange, BaseText, NodeEntry, Range } from 'slate';
import { getCursorRange } from '../utils/getCursorRange';
import { useRemoteCursorEditor } from './useRemoteCursorEditor';
import { useRemoteCursorStates } from './useRemoteCursorStates';

export const REMOTE_CURSOR_DECORATION_PREFIX = 'remote-cursor-';
export const REMOTE_CURSOR_CARET_DECORATION_PREFIX = 'remote-caret-';

export type RemoteCaretDecoration<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = {
  [
    key: `${typeof REMOTE_CURSOR_CARET_DECORATION_PREFIX}${string}`
  ]: CursorState<TCursorData> & { isBackward: boolean };
};

export type RemoteCursorDecoration<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = {
  [
    key: `${typeof REMOTE_CURSOR_DECORATION_PREFIX}${string}`
  ]: CursorState<TCursorData>;
};

export type RemoteCursorDecoratedRange<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseRange & RemoteCursorDecoration<TCursorData>;

export type RemoteCaretDecoratedRange<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseRange & RemoteCaretDecoration<TCursorData>;

export type TextWithRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseText &
  RemoteCursorDecoration<TCursorData> &
  RemoteCaretDecoration<TCursorData>;

export function getRemoteCursorsOnLeaf<
  TCursorData extends Record<string, unknown>,
  TLeaf extends TextWithRemoteCursors<TCursorData>
>(leaf: TLeaf): CursorState<TCursorData>[] {
  return Object.entries(leaf)
    .filter(([key]) => key.startsWith(REMOTE_CURSOR_DECORATION_PREFIX))
    .map(([, data]) => data);
}

export function getRemoteCaretsOnLeaf<
  TCursorData extends Record<string, unknown>,
  TLeaf extends TextWithRemoteCursors<TCursorData>
>(leaf: TLeaf): (CursorState<TCursorData> & { isBackward: boolean })[] {
  return Object.entries(leaf)
    .filter(([key]) => key.startsWith(REMOTE_CURSOR_CARET_DECORATION_PREFIX))
    .map(([, data]) => data);
}

export type UseDecorateRemoteCursorsOptions = {
  carets?: boolean;
};

function getDecoration<
  TCursorData extends Record<string, unknown>,
  TCaret extends boolean
>(
  clientId: string,
  state: CursorState<TCursorData>,
  range: BaseRange,
  caret: TCaret
): TCaret extends true
  ? RemoteCursorDecoratedRange<TCursorData>
  : RemoteCaretDecoratedRange<TCursorData> {
  if (!caret) {
    const key = `${REMOTE_CURSOR_DECORATION_PREFIX}${clientId}`;
    return { ...range, [key]: state };
  }

  const key = `${REMOTE_CURSOR_CARET_DECORATION_PREFIX}${clientId}`;
  return {
    ...range,
    anchor: range.focus,
    [key]: state,
  };
}

export function useDecorateRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>({ carets = true }: UseDecorateRemoteCursorsOptions = {}) {
  const editor = useRemoteCursorEditor<TCursorData>();
  const cursors = useRemoteCursorStates<TCursorData>();

  const cursorsRef = useRef(cursors);
  cursorsRef.current = cursors;

  return useCallback(
    (entry: NodeEntry) => {
      const [, path] = entry;
      if (path.length !== 0) {
        return [];
      }

      return Object.entries(cursorsRef.current).flatMap(([clientId, state]) => {
        const range = getCursorRange(editor, state);
        if (!range) {
          return [];
        }

        if (carets && Range.isCollapsed(range)) {
          return getDecoration(clientId, state, range, true);
        }

        if (!carets) {
          return getDecoration(clientId, state, range, false);
        }

        return [
          getDecoration(clientId, state, range, false),
          getDecoration(clientId, state, range, true),
        ];
      });
    },
    [carets, editor]
  );
}
