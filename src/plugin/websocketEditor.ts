import { Editor } from 'slate';
import { WebsocketProvider } from 'y-websocket';
import { YJsEditor, YJsEditorOptions } from './yjsEditor';

export interface WebsocketEditor extends Editor {
  connect: () => void;
  disconnect: () => void;
  websocketProvider: WebsocketProvider;
}

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
