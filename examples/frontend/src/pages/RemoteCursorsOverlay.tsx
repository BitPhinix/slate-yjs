import { HocuspocusProvider } from '@hocuspocus/provider';
import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import {
  SelectionRectComponentProps,
  RemoteCursorOverlay,
} from '@slate-yjs/react';
import { name } from 'faker';
import randomColor from 'randomcolor';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { Element } from '../components/Element/Element';
import { Leaf } from '../components/Leaf';
import { withMarkdown } from '../plugins/withMarkdown';
import { CursorData } from '../types';

type CaretProps = {
  isCollapsed: boolean;
  isForward: boolean;
  data: CursorData;
};

function Caret({ isCollapsed, isForward, data }: CaretProps) {
  const isStart = !isCollapsed && isForward;
  const caretStyle: CSSProperties = {
    [isStart ? 'right' : 'left']: 0,
    background: data.color,
  };

  const labelStyle: CSSProperties = {
    transform: 'translateY(-100%)',
    background: data.color,
  };

  return (
    <div style={caretStyle} className="h-full w-0.5 absolute">
      <div
        className="absolute text-xs text-white whitespace-nowrap top-0 rounded rounded-bl-none px-1.5 py-0.5"
        style={labelStyle}
      >
        {data.name}
      </div>
    </div>
  );
}

function SelectionRect({
  position,
  data,
  isCaret,
  isForward,
  isCollapsed,
}: SelectionRectComponentProps<CursorData>) {
  const selectionStyle: CSSProperties = {
    ...position,
    // Add a opacity to the background color
    backgroundColor: data.color + '66',
  };

  return (
    <div style={selectionStyle} className="absolute pointer-events-none">
      {isCaret && (
        <Caret isCollapsed={isCollapsed} data={data} isForward={isForward} />
      )}
    </div>
  );
}

export function RemoteCursorsOverlay() {
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

  const editor = useMemo(() => {
    const cursorData: CursorData = {
      color: randomColor({
        luminosity: 'dark',
        alpha: 1,
        format: 'hex',
      }),
      name: `${name.firstName()} ${name.lastName()}`,
    };

    const sharedType = yDoc.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withReact(
        withYHistory(
          withCursors(withYjs(createEditor(), sharedType), provider.awareness, {
            data: cursorData,
          })
        )
      )
    );
  }, []);

  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => () => YjsEditor.disconnect(editor), [editor]);

  return (
    <Slate value={value} onChange={setValue} editor={editor}>
      <RemoteCursorOverlay
        SelectionRectComponent={SelectionRect}
        className="flex justify-center"
      >
        <Editable
          className="py-32 max-w-4xl w-full mx-10 flex-col"
          renderElement={Element}
          renderLeaf={Leaf}
        />
        <ConnectionToggle connected={connected} onClick={toggleConnection} />
      </RemoteCursorOverlay>
    </Slate>
  );
}
