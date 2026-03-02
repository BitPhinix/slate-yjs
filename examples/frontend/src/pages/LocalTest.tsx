import { withYHistory, withYjs, YjsEditor } from '@getguru/slate-yjs-core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';

/**
 * A local-only test page for e2e testing.
 * This page creates two editors sharing the same Yjs document locally,
 * without requiring a websocket backend.
 */
export function LocalTestPage() {
  const [value1, setValue1] = useState<Descendant[]>([]);
  const [value2, setValue2] = useState<Descendant[]>([]);

  // Shared Yjs document between both editors
  const doc = useMemo(() => new Y.Doc(), []);

  const editor1 = useMemo(() => {
    const sharedType = doc.get('content', Y.XmlText) as Y.XmlText;
    return withMarkdown(
      withNormalize(
        withReact(withYHistory(withYjs(createEditor(), sharedType)))
      )
    );
  }, [doc]);

  const editor2 = useMemo(() => {
    const sharedType = doc.get('content', Y.XmlText) as Y.XmlText;
    return withMarkdown(
      withNormalize(
        withReact(withYHistory(withYjs(createEditor(), sharedType)))
      )
    );
  }, [doc]);

  useEffect(() => {
    YjsEditor.connect(editor1);
    YjsEditor.connect(editor2);
    return () => {
      YjsEditor.disconnect(editor1);
      YjsEditor.disconnect(editor2);
    };
  }, [editor1, editor2]);

  return (
    <div className="flex flex-col gap-8 my-16 mx-10">
      <h1 className="text-2xl font-bold text-center">
        Local Sync Test (Two Editors, One Document)
      </h1>

      <div className="flex gap-8 justify-center">
        <div className="flex-1 max-w-xl border border-gray-300 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Editor 1</h2>
          <Slate value={value1} onChange={setValue1} editor={editor1}>
            <FormatToolbar />
            <CustomEditable
              className="min-h-[200px] break-words"
              data-testid="editor-1"
            />
          </Slate>
        </div>

        <div className="flex-1 max-w-xl border border-gray-300 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Editor 2</h2>
          <Slate value={value2} onChange={setValue2} editor={editor2}>
            <FormatToolbar />
            <CustomEditable
              className="min-h-[200px] break-words"
              data-testid="editor-2"
            />
          </Slate>
        </div>
      </div>

      <div className="text-center text-gray-600">
        <p>Both editors share the same Yjs document locally.</p>
        <p>Changes in one editor should appear in the other instantly.</p>
      </div>
    </div>
  );
}
