import { Awareness } from 'y-protocols/awareness';
import { absolutePositionToRelativePosition } from '../cursor/utils';
import { YjsEditor } from './yjsEditor';

export interface CursorEditor extends YjsEditor {
  awareness: Awareness;
}

export const CursorEditor = {
  updateCursor: (e: CursorEditor): void => {
    const anchor =
      e.selection &&
      absolutePositionToRelativePosition(e.sharedType, e.selection.anchor);

    const focus =
      e.selection &&
      absolutePositionToRelativePosition(e.sharedType, e.selection.focus);

    e.awareness.setLocalStateField('anchor', anchor);
    e.awareness.setLocalStateField('focus', focus);
  },
};

export function withCursor<T extends YjsEditor>(
  editor: T,
  awareness: Awareness
): T & CursorEditor {
  const e = editor as T & CursorEditor;

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
