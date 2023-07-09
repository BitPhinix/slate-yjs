import { ReactEditor } from 'slate-react';
import { BaseRange } from 'slate';

export function reactEditorToDomRangeSafe(
  editor: ReactEditor,
  range: BaseRange
): Range | null {
  try {
    return ReactEditor.toDOMRange(editor, range);
  } catch (e) {
    return null;
  }
}
