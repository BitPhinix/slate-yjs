import { Logger } from '@hocuspocus/extension-logger';
import { SQLite } from '@hocuspocus/extension-sqlite';
import { Server } from '@hocuspocus/server';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';
import initialValue from './data/initialValue.json';

let date = new Date();
// Minimal hocuspocus server setup with logging. For more in-depth examples
// take a look at: https://github.com/ueberdosis/hocuspocus/tree/main/demos/backend
const server = Server.configure({
  port: parseInt(process.env.PORT ?? '', 10) || 1234,

  extensions: [
    new Logger(),
    new SQLite({
      database: 'db.sqlite',
    }),
  ],


  async onLoadDocument(data) {
    date = new Date();
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
