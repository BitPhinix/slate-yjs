import { Range } from 'slate';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import {
  relativeRangeToSlateRange,
  slateRangeToRelativeRange,
} from '../utils/position';
import { YjsEditor } from './withYjs';

export type CursorEditor = YjsEditor & {
  awareness: Awareness;
  sendCursorPosition: (range: Range | null) => void;
};

export const CursorEditor = {
  isCursorEditor(v: unknown): v is CursorEditor {
    return (
      YjsEditor.isYjsEditor(v) &&
      (v as CursorEditor).awareness instanceof Awareness &&
      typeof (v as CursorEditor).sendCursorPosition === 'function'
    );
  },

  sendCursorPositions(
    editor: CursorEditor,
    range: Range | null = editor.selection
  ) {
    editor.sendCursorPosition(range);
  },

  remoteCursors(editor: CursorEditor): Record<string, Range> {
    const clientId = editor.awareness.clientID.toString();

    return Object.fromEntries(
      Object.entries(editor.awareness.getStates())
        .map(([id, relativeRange]) => {
          // Ignore own state
          if (id === clientId) {
            return null;
          }

          const selection = relativeRangeToSlateRange(
            editor.sharedRoot,
            editor,
            relativeRange
          );

          if (!selection) {
            return null;
          }

          return [id, selection];
        })
        .filter(Array.isArray)
    );
  },
};

export type WithCursorsOptions = {
  cursorStateField?: string;
  autoSend?: boolean;
};

export function withCursors<T extends YjsEditor>(
  editor: T,
  awareness: Awareness,
  { cursorStateField = 'cursors', autoSend = true }: WithCursorsOptions = {}
): T & CursorEditor {
  const e = editor as T & CursorEditor;

  e.awareness = awareness;

  if (autoSend) {
    const { onChange } = e;
    e.onChange = () => {
      onChange();
      CursorEditor.sendCursorPositions(e);
    };
  }

  e.sendCursorPosition = (range) => {
    const localState = awareness.getLocalState();
    const currentRange = localState?.[cursorStateField];

    if (!range) {
      if (currentRange) {
        awareness.setLocalStateField(cursorStateField, null);
      }

      return;
    }

    const { anchor, focus } = slateRangeToRelativeRange(e.sharedRoot, e, range);

    if (
      !Y.compareRelativePositions(anchor, currentRange.anchor) ||
      !Y.compareRelativePositions(focus, currentRange.focus)
    ) {
      awareness.setLocalStateField(cursorStateField, { anchor, focus });
    }
  };

  return e;
}
