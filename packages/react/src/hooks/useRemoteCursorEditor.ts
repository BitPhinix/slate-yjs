import { CursorEditor } from '@slate-yjs/core';
import { ReactEditor, useSlateStatic } from 'slate-react';

export function useRemoteCursorEditor<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>(): CursorEditor<TCursorData> & ReactEditor {
  const editor = useSlateStatic();
  if (!CursorEditor.isCursorEditor(editor)) {
    throw new Error(
      'Cannot use useSyncExternalStore outside the context of a RemoteCursorEditor'
    );
  }

  return editor as CursorEditor & ReactEditor;
}
