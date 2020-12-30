import { Editor } from 'slate';
import { WebsocketProvider } from 'y-websocket';
import { YjsEditor } from './yjsEditor';

export interface WebsocketEditor extends Editor {
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
  websocketProvider: WebsocketProvider;
}

export type WebsocketEditorOptions = {
  roomName: string;
  endpoint: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
} & NonNullable<ConstructorParameters<typeof WebsocketProvider>[3]>;

export function withWebsocket<T extends YjsEditor>(
  editor: T,
  {
    endpoint,
    roomName,
    onConnect,
    onDisconnect,
    ...options
  }: WebsocketEditorOptions
): T & WebsocketEditor {
  const e = editor as T & WebsocketEditor;

  e.websocketProvider = new WebsocketProvider(endpoint, roomName, e.doc, {
    connect: false,
    ...options,
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

  e.destroy = () => {
    e.websocketProvider.destroy();
  };

  return e;
}
