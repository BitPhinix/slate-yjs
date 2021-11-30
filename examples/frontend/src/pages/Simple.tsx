import { withYjs, withYHistory, YjsEditor } from '@slate-yjs/core/dist';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { Element } from '../components/Element/Element';
import { Leaf } from '../components/Leaf';
import { withMarkdown } from '../plugins/withMarkdown';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';

export function Simple() {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const [yDoc, provider] = useMemo(() => {
    const yDoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: 'slate-yjs-demo',
      document: yDoc,
      connect: false,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });

    return [yDoc, provider];
  }, []);

  useEffect(() => {
    provider.connect();
    return () => provider.disconnect();
  }, []);

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }

    provider.connect();
  }, [provider, connected]);

  const editor = useMemo(
    () =>
      withMarkdown(
        withReact(
          withYHistory(
            withYjs(createEditor(), yDoc.get('content', Y.XmlText) as Y.XmlText)
          )
        )
      ),
    []
  );

  // Disconnect YjsEditor on unmount in order to free up resources
  React.useEffect(() => () => YjsEditor.disconnect(editor), [editor]);

  (window as any).editor = editor;
  (window as any).YjsEditor = YjsEditor;

  return (
    <div className="flex justify-center">
      <Slate value={value} onChange={setValue} editor={editor}>
        <Editable
          className="py-32 max-w-4xl w-full mx-10 flex-col"
          renderElement={Element}
          renderLeaf={Leaf}
        />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}
