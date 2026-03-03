import { withYHistory, withYjs, YjsEditor } from '@getguru/slate-yjs-core';
import React, { useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';

/**
 * A local-only test page for e2e testing.
 * This page creates two editors with separate Yjs documents that sync via updates,
 * simulating real network collaboration without requiring a websocket backend.
 */
export function LocalTestPage() {
  const [value1, setValue1] = useState<Descendant[]>([]);
  const [value2, setValue2] = useState<Descendant[]>([]);

  // Two separate Yjs documents that sync via updates (like real network sync)
  const doc1 = useMemo(() => new Y.Doc(), []);
  const doc2 = useMemo(() => new Y.Doc(), []);

  const editor1 = useMemo(() => {
    const sharedType = doc1.get('content', Y.XmlText) as Y.XmlText;
    return withMarkdown(
      withNormalize(
        withReact(withYHistory(withYjs(createEditor(), sharedType)))
      )
    );
  }, [doc1]);

  const editor2 = useMemo(() => {
    const sharedType = doc2.get('content', Y.XmlText) as Y.XmlText;
    return withMarkdown(
      withNormalize(
        withReact(withYHistory(withYjs(createEditor(), sharedType)))
      )
    );
  }, [doc2]);

  // Set up bidirectional sync between the two documents
  useEffect(() => {
    // Sync doc1 changes to doc2
    const syncDoc1ToDoc2 = (update: Uint8Array, origin: unknown) => {
      // Skip if this update came from sync to avoid infinite loops
      if (origin === 'sync') return;
      Y.applyUpdate(doc2, update, 'sync');
    };
    
    // Sync doc2 changes to doc1
    const syncDoc2ToDoc1 = (update: Uint8Array, origin: unknown) => {
      // Skip if this update came from sync to avoid infinite loops
      if (origin === 'sync') return;
      Y.applyUpdate(doc1, update, 'sync');
    };

    doc1.on('update', syncDoc1ToDoc2);
    doc2.on('update', syncDoc2ToDoc1);

    return () => {
      doc1.off('update', syncDoc1ToDoc2);
      doc2.off('update', syncDoc2ToDoc1);
    };
  }, [doc1, doc2]);

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
