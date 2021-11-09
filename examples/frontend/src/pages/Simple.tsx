import { withYjs } from '@slate-yjs/core';
import React, { useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { Element } from '../components/Element/Element';
import { Leaf } from '../components/Leaf';
import { withMarkdown } from '../plugins/withMarkdown';

export function Simple() {
  const [value, setValue] = useState<Descendant[]>([]);

  const [yDoc, provider] = useMemo(() => {
    const yDoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: 'slate-yjs-demo',
      document: yDoc,
      connect: false,
    });

    return [yDoc, provider];
  }, []);

  useEffect(() => {
    provider.connect();
    return () => provider.disconnect();
  }, []);

  const editor = useMemo(
    () =>
      withMarkdown(
        withReact(
          withYjs(createEditor(), yDoc.get('content', Y.XmlText) as Y.XmlText)
        )
      ),
    []
  );

  return (
    <div className="flex justify-center">
      <Slate value={value} onChange={setValue} editor={editor}>
        <Editable
          className="py-32 max-w-4xl w-full mx-10 flex-col"
          renderElement={Element}
          renderLeaf={Leaf}
        />
      </Slate>
    </div>
  );
}
