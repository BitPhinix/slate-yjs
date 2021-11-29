import { Editor, Transforms } from 'slate';
import * as Y from 'yjs';
import { HistoryStackItem, RelativeRange } from '../model/types';
import {
  relativeRangeToSlateRange,
  slateRangeToRelativeRange,
} from '../utils/position';
import { YjsEditor } from './withYjs';

const LAST_SELECTION: WeakMap<Editor, RelativeRange | null> = new WeakMap();

export type YHistoryEditor = YjsEditor & {
  undoManager: Y.UndoManager;

  undo: () => void;
  redo: () => void;
};

export const YHistoryEditor = {
  isYHistoryEditor(v: unknown): v is YHistoryEditor {
    return (
      YjsEditor.isYjsEditor(v) &&
      (v as YHistoryEditor).undoManager instanceof Y.UndoManager &&
      typeof (v as YHistoryEditor).undo === 'function' &&
      typeof (v as YHistoryEditor).redo === 'function'
    );
  },

  canUndo(editor: YHistoryEditor) {
    return editor.undoManager.undoStack.length > 0;
  },

  canRedo(editor: YHistoryEditor) {
    return editor.undoManager.redoStack.length > 0;
  },
};

export type WithYHistoryOptions = NonNullable<
  ConstructorParameters<typeof Y.UndoManager>[1]
>;

export function withYHistory<T extends YjsEditor>(
  editor: T,
  {
    trackedOrigins = new Set([editor.localOrigin]),
    ...options
  }: WithYHistoryOptions = {}
): T & YHistoryEditor {
  const e = editor as T & YHistoryEditor;

  const undoManager = new Y.UndoManager(e.sharedRoot, {
    trackedOrigins,
    ...options,
  });

  const { onChange } = e;
  e.onChange = () => {
    onChange();

    LAST_SELECTION.set(
      e,
      e.selection && slateRangeToRelativeRange(e.sharedRoot, e, e.selection)
    );
  };

  undoManager.on(
    'stack-item-added',
    ({ stackItem }: { stackItem: HistoryStackItem; type: 'redo' | 'undo' }) => {
      stackItem.meta.set(
        'selection',
        e.selection && slateRangeToRelativeRange(e.sharedRoot, e, e.selection)
      );

      if (!stackItem.meta.has('selectionBefore')) {
        stackItem.meta.set('selectionBefore', LAST_SELECTION.get(e));
      }
    }
  );

  undoManager.on(
    'stack-item-popped',
    ({
      stackItem,
      type,
    }: {
      stackItem: HistoryStackItem;
      type: 'redo' | 'undo';
    }) => {
      // TODO: Change once https://github.com/yjs/yjs/issues/353 is resolved
      const inverseStack =
        type === 'undo' ? undoManager.redoStack : undoManager.undoStack;
      const inverseItem = inverseStack[inverseStack.length - 1];
      if (inverseItem) {
        inverseItem.meta.set(
          'selection',
          stackItem.meta.get('selectionBefore')
        );
        inverseItem.meta.set(
          'selectionBefore',
          stackItem.meta.get('selection')
        );
      }

      const relativeSelection = stackItem.meta.get(
        'selectionBefore'
      ) as RelativeRange | null;

      if (!relativeSelection) {
        return;
      }

      const selection = relativeRangeToSlateRange(
        e.sharedRoot,
        e,
        relativeSelection
      );

      if (!selection) {
        return;
      }

      Transforms.select(e, selection);
    }
  );

  e.undoManager = undoManager;

  e.undo = () => {
    YjsEditor.flushLocalOperations(e);
    e.undoManager.undo();
  };

  e.redo = () => {
    YjsEditor.flushLocalOperations(e);
    e.undoManager.redo();
  };

  return e;
}
