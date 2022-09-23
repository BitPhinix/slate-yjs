import { CursorState } from '@slate-yjs/core';
import { useCallback, useRef } from 'react';
import { BaseRange, BaseText, NodeEntry, Range } from 'slate';
import { getCursorRange } from '../utils/getCursorRange';
import { useRemoteCursorEditor } from './useRemoteCursorEditor';
import { useRemoteCursorStates } from './useRemoteCursorStates';

export const REMOTE_CURSOR_DECORATION_PREFIX = 'remote-cursor-';

export type RemoteCursorDecoration<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = {
  [
    key: `${typeof REMOTE_CURSOR_DECORATION_PREFIX}${string}`
  ]: // eslint-disable-next-line @typescript-eslint/ban-types
  CursorState<TCursorData> & ({ isCaret: true; isBackward: boolean } | {});
};

export type RemoteCursorDecoratedRange<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseRange & RemoteCursorDecoration<TCursorData>;

export type TextWithRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseText & RemoteCursorDecoration<TCursorData>;

export function getRemoteCursorsOnLeaf<
  TCursorData extends Record<string, unknown>,
  TText extends TextWithRemoteCursors<TCursorData>
>(text: TText): Record<string, CursorState<TCursorData>> {
  return Object.fromEntries(
    Object.entries(text).filter(([key]) =>
      key.startsWith(REMOTE_CURSOR_DECORATION_PREFIX)
    )
  );
}

export type UseDecorateRemoteCursorsOptions = {
  carets?: boolean;
};

function getDecoration<TCursorData extends Record<string, unknown>>(
  clientId: string,
  state: CursorState<TCursorData>,
  range: BaseRange,
  caret: boolean
): RemoteCursorDecoratedRange<TCursorData> {
  const key = `${REMOTE_CURSOR_DECORATION_PREFIX}${clientId}`;
  if (!caret) {
    return { ...range, [key]: state };
  }

  return {
    ...range,
    [key]: { ...state, isBackward: Range.isBackward(range), isCaret: true },
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
