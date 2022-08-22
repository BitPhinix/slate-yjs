import { CursorState } from '@slate-yjs/core';
import { useCallback, useRef } from 'react';
import { BaseRange, BaseText, NodeEntry, Range } from 'slate';
import { getCursorRange } from '../utils/getCursorRange';
import { useRemoteCursorEditor } from './useRemoteCursorEditor';
import { useRemoteCursors } from './useRemoteCursors';

export const REMOTE_CURSOR_DECORATION_PREFIX = 'remote-cursor-';

export type RemoteCursorDecoration<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = {
  [
    key: `${typeof REMOTE_CURSOR_DECORATION_PREFIX}${string}`
  ]: CursorState<TCursorData> & { isCaret?: true };
};

export type RemoteCursorDecoratedRange<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseRange & RemoteCursorDecoration<TCursorData>;

export type TextWithRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = BaseText & RemoteCursorDecoration<TCursorData>;

export function getRemoteCursorsOnText<
  TText extends TextWithRemoteCursors<TCursorData>,
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>(text: TText): Record<string, CursorState<TCursorData>> {
  return Object.fromEntries(
    Object.entries(text).filter(([key]) =>
      key.startsWith(REMOTE_CURSOR_DECORATION_PREFIX)
    )
  );
}

export type UseDecorateRemoteCursorsOptions = {
  decorateCarets?: boolean;
};

export function useDecorateRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>({ decorateCarets = true }: UseDecorateRemoteCursorsOptions = {}) {
  const editor = useRemoteCursorEditor<TCursorData>();
  const cursors = useRemoteCursors<TCursorData>();

  const cursorsRef = useRef(cursors);
  cursorsRef.current = cursors;

  return useCallback(
    (entry: NodeEntry) => {
      const [, path] = entry;
      if (path.length !== 0) {
        return [];
      }

      return Object.entries(cursorsRef.current).flatMap(([key, data]) => {
        const range = getCursorRange(editor, data);
        if (!range) {
          return [];
        }

        if (decorateCarets && Range.isCollapsed(range)) {
          return {
            ...range,
            [`${REMOTE_CURSOR_DECORATION_PREFIX}${key}`]: {
              ...data,
              isCaret: true,
            },
          };
        }

        const rangeDecoration: RemoteCursorDecoration<TCursorData> = {
          ...range,
          [`${REMOTE_CURSOR_DECORATION_PREFIX}${key}`]: data,
        };

        if (!decorateCarets) {
          return [rangeDecoration];
        }

        const caretDecoration = {
          anchor: range.anchor,
          focus: range.anchor,
          [`${REMOTE_CURSOR_DECORATION_PREFIX}${key}`]: {
            ...data,
            isCaret: true,
          },
        };

        return [rangeDecoration, caretDecoration];
      });
    },
    [decorateCarets, editor]
  );
}
