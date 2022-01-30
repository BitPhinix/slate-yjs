import { HocuspocusProvider } from '@hocuspocus/provider';
import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import { name } from 'faker';
import randomColor from 'randomcolor';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant } from 'slate';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../../components/ConnectionToggle/ConnectionToggle';
import { Element } from '../../components/Element/Element';
import { Leaf } from '../../components/Leaf';
import { HOCUSPOCUS_ENDPOINT_URL, HOCUSPOCUS_WRITE_KEY } from '../../config';
import { withMarkdown } from '../../plugins/withMarkdown';
import type { CursorData } from '../../types';
import { RemoteCursorOverlay } from './Overlay';

export function RemoteCursorsOverlay() {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: HOCUSPOCUS_ENDPOINT_URL,
        parameters: { key: HOCUSPOCUS_WRITE_KEY },
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
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
    const cursorData: CursorData = {
      color: randomColor({
        luminosity: 'dark',
        alpha: 1,
        format: 'hex',
      }),
      name: `${name.firstName()} ${name.lastName()}`,
    };

    const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withReact(
        withYHistory(
          withCursors(withYjs(createEditor(), sharedType), provider.awareness, {
            data: cursorData,
          })
        )
      )
    );
  }, [provider.awareness, provider.document]);

  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => () => YjsEditor.disconnect(editor), [editor]);
  useEffect(() => () => provider.disconnect(), [provider]);

  return (
    <Slate value={value} onChange={setValue} editor={editor}>
      <RemoteCursorOverlay className="flex justify-center my-32 mx-10">
        <Editable
          className="max-w-4xl w-full flex-col break-words"
          renderElement={Element}
          renderLeaf={Leaf}
          placeholder="Write something ..."
        />
      </RemoteCursorOverlay>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </Slate>
  );
}
