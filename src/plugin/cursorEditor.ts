import { Editor } from 'slate';
import invariant from 'tiny-invariant';
import { Awareness } from 'y-protocols/awareness';
import { absolutePositionToRelativePosition } from '../cursor/utils';
import { YjsEditor } from './yjsEditor';

const AWARENESS: WeakMap<Editor, Awareness> = new WeakMap();

export interface CursorEditor extends YjsEditor {
  awareness: Awareness;
}

export const CursorEditor = {
  awareness(editor: CursorEditor): Awareness {
    const awareness = AWARENESS.get(editor);
    invariant(awareness, 'CursorEditor without attaches awareness');
    return awareness;
  },

  updateCursor: (editor: CursorEditor): void => {
    const sharedType = YjsEditor.sharedType(editor);
    const { selection } = editor;

    const anchor =
      selection &&
      absolutePositionToRelativePosition(sharedType, selection.anchor);

    const focus =
      selection &&
      absolutePositionToRelativePosition(sharedType, selection.focus);

    const awareness = CursorEditor.awareness(editor);
    awareness.setLocalState({ ...awareness.getLocalState(), anchor, focus });
  },
};

export function withCursor<T extends YjsEditor>(
  editor: T,
  awareness: Awareness
): T & CursorEditor {
  const e = editor as T & CursorEditor;

  AWARENESS.set(e, awareness);
  e.awareness = awareness;

  const { onChange } = editor;

  e.onChange = () => {
    setTimeout(() => CursorEditor.updateCursor(e), 0);

    if (onChange) {
      onChange();
    }
  };

  return e;
}
