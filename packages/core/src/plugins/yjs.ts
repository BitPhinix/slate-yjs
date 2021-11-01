import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { applySlateOps } from '..';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';

const DEFAULT_ORIGIN = Symbol('slate-yjs');
const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_OPERATIONS: WeakMap<Editor, Operation[]> = new WeakMap();

export interface YjsEditor extends Editor {
  sharedRoot: Y.XmlText;
  localOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void;
  applyLocalOperation: (op: Operation) => void;

  initialize: () => void;
}

export const YjsEditor = {
  isYjsEditor(v: unknown): v is YjsEditor {
    return (
      Editor.isEditor(v) &&
      'sharedRoot' in v &&
      (v as YjsEditor).sharedRoot instanceof Y.XmlText
    );
  },

  applyRemoveEvents(editor: YjsEditor, events: Y.YEvent[], origin: unknown) {
    editor.applyRemoteEvents(events, origin);
  },

  applyLocalOperation(editor: YjsEditor, op: Operation) {
    editor.applyLocalOperation(op);
  },

  initialize(editor: YjsEditor) {
    editor.initialize();
  },

  remoteOrigin(editor: YjsEditor): unknown | undefined {
    return ORIGIN.get(editor);
  },

  localOperations(editor: YjsEditor): Operation[] {
    return LOCAL_OPERATIONS.get(editor) ?? [];
  },

  asRemoteOrigin(editor: YjsEditor, origin: unknown, fn: () => void) {
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

  e.applyRemoteEvents = (events, origin) => {
    YjsEditor.asRemoteOrigin(e, origin, () => {
      Editor.withoutNormalizing(e, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  e.initialize = () => {
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    e.onChange();
  };

  e.applyLocalOperation = (op) => {
    applySlateOp(root, e, op, e.localOrigin);
  };

  const { apply } = e;
  e.apply = (op) => {
    // TODO: Only flush on onChange
    if (YjsEditor.remoteOrigin(e) === undefined) {
      YjsEditor.applyLocalOperation(e, op);
    }

    apply(op);
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
