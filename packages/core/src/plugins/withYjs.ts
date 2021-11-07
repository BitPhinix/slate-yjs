import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';

const DEFAULT_ORIGIN = Symbol('slate-yjs');
const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();

export type YjsEditor = Editor & {
  sharedRoot: Y.XmlText;
  localOrigin: unknown;

  applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void;
  applyLocalOperation: (op: Operation) => void;

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
      typeof (value as YjsEditor).applyLocalOperation === 'function' &&
      typeof (value as YjsEditor).initialize === 'function'
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
