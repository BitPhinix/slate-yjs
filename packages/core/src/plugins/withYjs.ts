import { BaseEditor, Descendant, Editor, Operation, Point } from 'slate';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';
import {
  getStoredPosition,
  getStoredPositions,
  relativePositionToSlatePoint,
  removeStoredPosition,
  setStoredPosition,
  slatePointToRelativePosition,
} from '../utils/position';
import { assertDocumentAttachment } from '../utils/yjs';

type LocalChange = { op: Operation; doc: Descendant[] };

const DEFAULT_LOCAL_ORIGIN = Symbol('slate-yjs-operation');
const DEFAULT_POSITION_STORAGE_ORIGIN = Symbol('slate-yjs-position-storage');

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_CHANGES: WeakMap<Editor, LocalChange[]> = new WeakMap();
const CONNECTED: WeakSet<Editor> = new WeakSet();

export type YjsEditor = BaseEditor & {
  sharedRoot: Y.XmlText;

  localOrigin: unknown;
  positionStorageOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void;
  storeLocalOperation: (op: Operation) => void;
  flushLocalChanges: () => void;

  connect: () => void;
  disconnect: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      (value as YjsEditor).localOrigin !== undefined &&
      (value as YjsEditor).positionStorageOrigin !== undefined &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalOperation === 'function' &&
      typeof (value as YjsEditor).flushLocalChanges === 'function' &&
      typeof (value as YjsEditor).connect === 'function' &&
      typeof (value as YjsEditor).disconnect === 'function'
    );
  },

  localChanges(editor: YjsEditor): LocalChange[] {
    return LOCAL_CHANGES.get(editor) ?? [];
  },

  applyRemoteEvents(
    editor: YjsEditor,
    events: Y.YEvent[],
    origin: unknown
  ): void {
    editor.applyRemoteEvents(events, origin);
  },

  storeLocalOperation(editor: YjsEditor, op: Operation): void {
    editor.storeLocalOperation(op);
  },

  flushLocalChanges(editor: YjsEditor): void {
    editor.flushLocalChanges();
  },

  connected(editor: YjsEditor): boolean {
    return CONNECTED.has(editor);
  },

  connect(editor: YjsEditor): void {
    editor.connect();
  },

  disconnect(editor: YjsEditor): void {
    editor.disconnect();
  },

  remoteOrigin(editor: YjsEditor): unknown | undefined {
    return ORIGIN.get(editor);
  },

  asRemote(editor: YjsEditor, origin: unknown, fn: () => void): void {
    const prev = YjsEditor.remoteOrigin(editor);
    ORIGIN.set(editor, origin);

    fn();

    if (prev === undefined) {
      ORIGIN.delete(editor);
    } else {
      ORIGIN.set(editor, prev);
    }
  },

  storePosition(editor: YjsEditor, key: string, point: Point): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    const position = slatePointToRelativePosition(sharedRoot, editor, point);

    sharedRoot.doc.transact(() => {
      setStoredPosition(sharedRoot, key, position);
    }, locationStorageOrigin);
  },

  removeStoredPosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    sharedRoot.doc.transact(() => {
      removeStoredPosition(sharedRoot, key);
    }, locationStorageOrigin);
  },

  position(editor: YjsEditor, key: string): Point | null | undefined {
    const position = getStoredPosition(editor.sharedRoot, key);
    if (!position) {
      return undefined;
    }

    return relativePositionToSlatePoint(editor.sharedRoot, editor, position);
  },

  storedPositionsRelative(
    editor: YjsEditor
  ): Record<string, Y.RelativePosition> {
    return getStoredPositions(editor.sharedRoot);
  },
};

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing positions
  positionStorageOrigin?: unknown;
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedRoot: Y.XmlText,
  {
    localOrigin,
    positionStorageOrigin,
    autoConnect = true,
  }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = sharedRoot;

  e.localOrigin = localOrigin ?? DEFAULT_LOCAL_ORIGIN;
  e.positionStorageOrigin =
    positionStorageOrigin ?? DEFAULT_POSITION_STORAGE_ORIGIN;

  e.applyRemoteEvents = (events, eventOrigin) => {
    Editor.withoutNormalizing(e, () => {
      YjsEditor.asRemote(e, eventOrigin, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  const handleYEvents = (events: Y.YEvent[], transaction: Y.Transaction) => {
    if (transaction.origin === e.localOrigin) {
      return;
    }

    YjsEditor.applyRemoteEvents(e, events, transaction.origin);
  };

  let autoConnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  if (autoConnect) {
    autoConnectTimeoutId = setTimeout(() => {
      autoConnectTimeoutId = null;
      YjsEditor.connect(e);
    });
  }

  e.connect = () => {
    sharedRoot.observeDeep(handleYEvents);
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    CONNECTED.add(e);
    e.onChange();
  };

  e.disconnect = () => {
    if (autoConnectTimeoutId) {
      clearTimeout(autoConnectTimeoutId);
    }

    YjsEditor.flushLocalChanges(e);
    sharedRoot.unobserveDeep(handleYEvents);
    CONNECTED.delete(e);
  };

  e.storeLocalOperation = (op) => {
    LOCAL_CHANGES.set(e, [
      ...YjsEditor.localChanges(e),
      { op, doc: editor.children },
    ]);
  };

  e.flushLocalChanges = () => {
    const localOperations = YjsEditor.localChanges(e);
    LOCAL_CHANGES.delete(e);

    assertDocumentAttachment(e.sharedRoot);
    e.sharedRoot.doc.transact(() => {
      localOperations.forEach((op) => {
        applySlateOp(e.sharedRoot, { children: op.doc }, op.op);
      });
    }, e.localOrigin);
  };

  const { apply, onChange } = e;
  e.apply = (op) => {
    if (YjsEditor.connected(e) && YjsEditor.remoteOrigin(e) === undefined) {
      YjsEditor.storeLocalOperation(e, op);
    }

    apply(op);
  };

  e.onChange = () => {
    if (YjsEditor.connected(e)) {
      YjsEditor.flushLocalChanges(e);
    }

    onChange();
  };

  return e;
}
