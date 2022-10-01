import { CursorEditor } from '@slate-yjs/core';
import { useCallback, useEffect } from 'react';
import { useFocused } from 'slate-react';
import { useRemoteCursorEditor } from './useRemoteCursorEditor';

export function useUnsetCursorPositionOnBlur() {
  const editor = useRemoteCursorEditor();
  const isSlateFocused = useFocused();

  const sendCursorPosition = useCallback(
    (isFocused?: boolean) => {
      if (isFocused && editor.selection) {
        CursorEditor.sendCursorPosition(editor, editor.selection);
        return;
      }

      if (!isFocused) {
        CursorEditor.sendCursorPosition(editor, null);
      }
    },
    [editor]
  );

  useEffect(() => {
    const handleWindowBlur = () => {
      if (isSlateFocused) {
        sendCursorPosition(false);
      }
    };

    const handleWindowFocus = () => {
      if (isSlateFocused) {
        sendCursorPosition(true);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isSlateFocused, sendCursorPosition]);

  useEffect(() => {
    sendCursorPosition(isSlateFocused);
  }, [editor, isSlateFocused, sendCursorPosition]);
}
