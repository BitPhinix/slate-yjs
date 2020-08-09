import { Editor, Operation } from 'slate';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { applySlateOps as applySlateOperations } from '../apply';
import { toSlateOps } from '../convert';
import { SyncDoc, SyncElement } from '../model';

export interface YJsEditor extends Editor {
  isRemote: boolean;
  doc: Y.Doc;
  syncDoc: SyncDoc;
}

export interface WebsocketEditor extends Editor {
  connect: () => void;
  disconnect: () => void;
  websocketProvider: WebsocketProvider;
}

export type YJsEditorOptions = {
  roomName: string;
  endpoint: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
} & NonNullable<ConstructorParameters<typeof WebsocketProvider>[3]>;

const YJsEditor = {
  /**
   * Apply slate ops to YJs
   */
  applySlateOps: (e: YJsEditor, operations: Operation[]) => {
    try {
      e.doc.transact(() => {
        applySlateOperations(e.syncDoc, operations);
      });
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Apply YJs events to slate
   */
  applyEvents: (e: YJsEditor, events: Y.YEvent[]) => {
    const remoteEvents = events.filter(event => !event.transaction.local);
    if (remoteEvents.length == 0) {
      return;
    }

    e.isRemote = true;

    Editor.withoutNormalizing(e, () => {
      toSlateOps(remoteEvents).forEach(op => {
        e.apply(op);
      });
    });

    Promise.resolve().then(() => (e.isRemote = false));
  }
};

export const withWebsocket = <T extends YJsEditor>(
  editor: T,
  { endpoint, roomName, onConnect, onDisconnect, ...options }: YJsEditorOptions
): T & WebsocketEditor => {
  const e = editor as T & WebsocketEditor;

  e.websocketProvider = new WebsocketProvider(endpoint, roomName, e.doc, {
    connect: false,
    ...options
  });

  e.websocketProvider.on('status', (event: { status: string }) => {
    if (event.status === 'connected' && onConnect) {
      onConnect();
    }

    if (event.status === 'disconnected' && onDisconnect) {
      onDisconnect();
    }
  });

  e.connect = () => {
    e.websocketProvider.connect();
  };

  e.disconnect = () => {
    e.websocketProvider.disconnect();
  };

  return e;
};

export const withYJs = <T extends Editor>(editor: T): T & YJsEditor => {
  const e = editor as T & YJsEditor;

  const doc = new Y.Doc();
  const syncDoc = doc.getArray<SyncElement>('content');

  syncDoc.observeDeep(events => {
    YJsEditor.applyEvents(e, events);
  });

  e.doc = doc;
  e.syncDoc = syncDoc;
  e.isRemote = false;

  const { onChange } = editor;
  e.onChange = () => {
    if (!e.isRemote) {
      YJsEditor.applySlateOps(e, e.operations);
    }

    if (onChange) {
      onChange();
    }
  };

  return e;
};
