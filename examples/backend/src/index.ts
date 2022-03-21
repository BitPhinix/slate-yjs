import { Logger } from '@hocuspocus/extension-logger';
import { Server } from '@hocuspocus/server';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';
import initialValue from './data/initialValue.json';

// Minimal hocuspocus server setup with logging. For more in-depth examples
// take a look at: https://github.com/ueberdosis/hocuspocus/tree/main/demos/backend
const server = Server.configure({
  port: 1234,

  extensions: [new Logger()],

  async onLoadDocument(data) {
    if (data.document.isEmpty('content')) {
      const insertDelta = slateNodesToInsertDelta(initialValue);
      const sharedRoot = data.document.get(
        'content',
        Y.XmlText
      ) as unknown as Y.XmlText;
      sharedRoot.applyDelta(insertDelta);
    }

    return data.document;
  },
});

server.enableMessageLogging();
server.listen();
