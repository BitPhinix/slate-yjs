# Collaboration (Hocuspocus)

> Slate-yjs is connection provider agnostic, so even though other transport providers aren't covered in this guide, they might be better suited for your specific needs. You can find a full list of connection providers here: [https://docs.yjs.dev/ecosystem/connection-provider](https://docs.yjs.dev/ecosystem/connection-provider)

## Server-side setup

```javascript
import { Logger } from '@hocuspocus/extension-logger';
import { Server } from '@hocuspocus/server';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';

const initialValue = [{ type: "paragraph", children: [{ text: "" }]}]

// Setup the server
const server = Server.configure({
  port: 1234,

  // Add logging
  extensions: [new Logger()],

  async onLoadDocument(data) {
    // Load the initial value in case the document is empty
    if (data.document.isEmpty('content')) {
      const insertDelta = slateNodesToInsertDelta(initialValue);
      const sharedRoot = data.document.get('content', Y.XmlText);
      sharedRoot.applyDelta(insertDelta);
    }

    return data.document;
  },
});

// Start the server
server.enableMessageLogging();
server.listen();
```

## Client side setup

```javascript
import { HocuspocusProvider } from '@hocuspocus/provider';
import { withYHistory, withYjs, YjsEditor, withYHistory } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';

export function Editor() {
  const [value, setValue] = useState([]);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: 'ws://127.0.0.1:1234',
        name: 'slate-yjs-demo',
      }),
    []
  );

  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText);
    return withReact(withYHistory(withYjs(createEditor(), sharedType)));
  }, [provider.document]);

  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => () => YjsEditor.disconnect(editor), [editor]);
  useEffect(() => () => provider.disconnect(), [provider]);

  return (
    <Slate value={value} onChange={setValue} editor={editor}>
      <Editable
        ...
      />
    </Slate>
  );
}

```

