import { BaseEditor, Descendant, Editor, Operation, Point } from 'slate';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { RelativePositionRef } from '../model/types';
import { yTextToSlateElement } from '../utils/convert';
import {
  relativePositionToSlatePoint,
  slatePointToRelativePosition,
} from '../utils/location';
import { assertDocumentAttachment } from '../utils/yjs';

type LocalChange = { op: Operation; doc: Descendant[] };

const DEFAULT_LOCAL_ORIGIN = Symbol('slate-yjs-operation');
const DEFAULT_LOCATION_STORAGE_ORIGIN = Symbol('slate-yjs-location-storage');

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_CHANGES: WeakMap<Editor, LocalChange[]> = new WeakMap();

const STORED_LOCATION_PREFIX = '__slateYjsLocation_';

export type YjsEditor = BaseEditor & {
  sharedRoot: Y.XmlText;

  localOrigin: unknown;
  locationStorageOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void;
  storeLocalOperation: (op: Operation) => void;
  flushLocalOperations: () => void;

  connect: () => void;
  disconnect: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      (value as YjsEditor).localOrigin !== undefined &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalOperation === 'function' &&
      typeof (value as YjsEditor).flushLocalOperations === 'function' &&
      typeof (value as YjsEditor).connect === 'function' &&
      typeof (value as YjsEditor).disconnect === 'function'
    );
  },

  localOperations(editor: YjsEditor): LocalChange[] {
    return LOCAL_CHANGES.get(editor) ?? [];
  },

  applyRemoveEvents(
    editor: YjsEditor,
    events: Y.YEvent[],
    origin: unknown
  ): void {
    editor.applyRemoteEvents(events, origin);
  },

  storeLocalOperation(editor: YjsEditor, op: Operation): void {
    editor.storeLocalOperation(op);
  },

  flushLocalOperations(editor: YjsEditor): void {
    editor.flushLocalOperations();
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

  storePosition(
    editor: YjsEditor,
    key: string,
    point: Point,
    options: {
      affinity?: 'backward' | 'forward' | null;
    } = {}
  ): void {
    const { sharedRoot, locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    const position = slatePointToRelativePosition(sharedRoot, editor, point);
    const positionRef: RelativePositionRef = {
      affinity: options.affinity ?? 'forward',
      position,
    };

    sharedRoot.doc.transact(() => {
      sharedRoot.setAttribute(STORED_LOCATION_PREFIX + key, positionRef);
    }, locationStorageOrigin);
  },

  removePosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    sharedRoot.doc.transact(() => {
      sharedRoot.removeAttribute(STORED_LOCATION_PREFIX + key);
    }, locationStorageOrigin);
  },

  getPosition(editor: YjsEditor, key: string): Point | null {
    const positionRef: RelativePositionRef = editor.sharedRoot.getAttribute(
      STORED_LOCATION_PREFIX + key
    );

    if (!positionRef) {
      return null;
    }

    return relativePositionToSlatePoint(
      editor.sharedRoot,
      editor,
      positionRef.position
    );
  },

  storedPositionRefs(editor: YjsEditor): Record<string, RelativePositionRef> {
    return Object.fromEntries(
      Object.entries(editor.sharedRoot.getAttributes())
        .filter(([key]) => key.startsWith(STORED_LOCATION_PREFIX))
        .map(([key, value]) => [
          key.slice(STORED_LOCATION_PREFIX.length),
          value,
        ])
    );
  },
};

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing locations
  locationStorageOrigin?: unknown;
};

export function withYjs<T extends Editor>(
  editor: T,
  root: Y.XmlText,
  {
    localOrigin,
    locationStorageOrigin,
    autoConnect = true,
  }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = root;

  e.localOrigin = localOrigin ?? DEFAULT_LOCAL_ORIGIN;
  e.locationStorageOrigin =
    locationStorageOrigin ?? DEFAULT_LOCATION_STORAGE_ORIGIN;

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

    YjsEditor.applyRemoveEvents(e, events, transaction.origin);
  };

  e.connect = () => {
    root.observeDeep(handleYEvents);
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    e.onChange();
  };

  e.disconnect = () => {
    root.unobserveDeep(handleYEvents);
  };

  e.storeLocalOperation = (op) => {
    LOCAL_CHANGES.set(e, [
      ...YjsEditor.localOperations(e),
      { op, doc: editor.children },
    ]);
  };

  e.flushLocalOperations = () => {
    const localOperations = YjsEditor.localOperations(e);
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
    if (YjsEditor.remoteOrigin(e) === undefined) {
      YjsEditor.storeLocalOperation(e, op);
    }

    apply(op);
  };

  e.onChange = () => {
    YjsEditor.flushLocalOperations(e);
    onChange();
  };

  if (autoConnect) {
    setTimeout(() => {
      YjsEditor.connect(e);
    });
  }

  return e;
}
