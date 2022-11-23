import { HocuspocusProvider } from '@hocuspocus/provider';
import { withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { HOCUSPOCUS_ENDPOINT_URL } from '../config';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';

export function SimplePage() {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: HOCUSPOCUS_ENDPOINT_URL,
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
        connect: false,
      }),
    []
  );

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }

    provider.connect();
  }, [provider, connected]);

  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withNormalize(
        withReact(
          withYHistory(
            withYjs(createEditor(), sharedType, { autoConnect: false })
          )
        )
      )
    );
  }, [provider.document]);

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
  useEffect(() => {
    provider.connect();
    return () => provider.disconnect();
  }, [provider]);
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <div className="flex justify-center my-32 mx-10">
      <Slate value={value} onChange={setValue} editor={editor}>
        <FormatToolbar />
        <CustomEditable className="max-w-4xl w-full flex-col break-words" />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}
