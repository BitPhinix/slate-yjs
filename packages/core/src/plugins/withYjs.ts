import { Descendant, Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';

type LocalOperation = { op: Operation; doc: Descendant[] };

const DEFAULT_ORIGIN = Symbol('slate-yjs');
const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_OPERATIONS: WeakMap<Editor, LocalOperation[]> = new WeakMap();

export type YjsEditor = Editor & {
  sharedRoot: Y.XmlText;
  localOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void;
  storeLocalOperation: (op: Operation) => void;
  flushLocalOperations: () => void;

  initialize: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      (value as YjsEditor).localOrigin !== undefined &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalOperation === 'function' &&
      typeof (value as YjsEditor).initialize === 'function'
    );
  },

  localOperations(editor: YjsEditor): LocalOperation[] {
    return LOCAL_OPERATIONS.get(editor) ?? [];
  },

  applyRemoveEvents(editor: YjsEditor, events: Y.YEvent[], origin: unknown) {
    editor.applyRemoteEvents(events, origin);
  },

  storeLocalOperation(editor: YjsEditor, op: Operation) {
    editor.storeLocalOperation(op);
  },

  flushLocalOperations(editor: YjsEditor) {
    editor.flushLocalOperations();
  },

  initialize(editor: YjsEditor) {
    editor.initialize();
  },

  remoteOrigin(editor: YjsEditor): unknown | undefined {
    return ORIGIN.get(editor);
  },

  asRemote(editor: YjsEditor, origin: unknown, fn: () => void) {
    const prev = YjsEditor.remoteOrigin(editor);
    ORIGIN.set(editor, origin);
    fn();
    ORIGIN.set(editor, prev);
  },
};

export type WithYjsOptions = {
  autoInitialize?: boolean;
  origin?: unknown;
};

export function withYjs<T extends Editor>(
  editor: T,
  root: Y.XmlText,
  { origin, autoInitialize = true }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = root;
  e.localOrigin = origin ?? DEFAULT_ORIGIN;

  e.applyRemoteEvents = (events, eventOrigin) => {
    Editor.withoutNormalizing(e, () => {
      YjsEditor.asRemote(e, eventOrigin, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  e.initialize = () => {
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    e.onChange();
  };

  e.storeLocalOperation = (op) => {
    LOCAL_OPERATIONS.set(e, [
      ...YjsEditor.localOperations(e),
      { op, doc: editor.children },
    ]);
  };

  e.flushLocalOperations = () => {
    const localOperations = YjsEditor.localOperations(e);
    LOCAL_OPERATIONS.delete(e);

    if (!e.sharedRoot.doc) {
      throw new Error("sharedRoot isn't attach to a ydoc");
    }

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

  root.observeDeep((events, transaction) => {
    if (transaction.origin === e.localOrigin) {
      return;
    }

    YjsEditor.applyRemoveEvents(e, events, transaction.origin);
  });

  if (autoInitialize) {
    setTimeout(() => {
      YjsEditor.initialize(e);
    });
  }

  return e;
}
