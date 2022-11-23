import { HocuspocusProvider } from '@hocuspocus/provider';
import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  useDecorateRemoteCursors,
} from '@slate-yjs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant, Text } from 'slate';
import { RenderLeafProps, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { Leaf } from '../components/Leaf/Leaf';
import { HOCUSPOCUS_ENDPOINT_URL } from '../config';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';
import { CursorData } from '../types';
import { addAlpha, randomCursorData } from '../utils';

function renderDecoratedLeaf(props: RenderLeafProps) {
  getRemoteCursorsOnLeaf<CursorData, Text>(props.leaf).forEach((cursor) => {
    if (cursor.data) {
      props.children = (
        <span style={{ backgroundColor: addAlpha(cursor.data.color, 0.5) }}>
          {props.children}
        </span>
      );
    }
  });

  getRemoteCaretsOnLeaf<CursorData, Text>(props.leaf).forEach((caret) => {
    if (caret.data) {
      props.children = (
        <span className="relative">
          <span
            contentEditable={false}
            className="absolute top-0 bottom-0 w-0.5 left-[-1px]"
            style={{ backgroundColor: caret.data.color }}
          />
          <span
            contentEditable={false}
            className="absolute text-xs text-white left-[-1px] top-0 whitespace-nowrap rounded rounded-bl-none px-1.5 py-0.5 select-none"
            style={{
              backgroundColor: caret.data.color,
              transform: 'translateY(-100%)',
            }}
          >
            {caret.data.name}
          </span>
          {props.children}
        </span>
      );
    }
  });

  return <Leaf {...props} />;
}

function DecoratedEditable() {
  const decorate = useDecorateRemoteCursors();
  return (
    <CustomEditable
      className="max-w-4xl w-full flex-col break-words"
      decorate={decorate}
      renderLeaf={renderDecoratedLeaf}
    />
  );
}

export function RemoteCursorDecorations() {
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
          withCursors(
            withYHistory(
              withYjs(createEditor(), sharedType, { autoConnect: false })
            ),
            provider.awareness,
            {
              data: randomCursorData(),
            }
          )
        )
      )
    );
  }, [provider.awareness, provider.document]);

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
        <DecoratedEditable />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}
