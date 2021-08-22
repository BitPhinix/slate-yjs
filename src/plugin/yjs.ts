import { Editor, Operation } from 'slate';
import invariant from 'tiny-invariant';
import Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { SharedType, slateYjsSymbol } from '../model';
import { toSlateDoc } from '../utils';

const IS_REMOTE: WeakSet<Editor> = new WeakSet();
const LOCAL_OPERATIONS: WeakMap<Editor, Set<Operation>> = new WeakMap();
const SHARED_TYPES: WeakMap<Editor, SharedType> = new WeakMap();

export interface YjsEditor extends Editor {
  sharedType: SharedType;
}

export const YjsEditor = {
  /**
   * Set the editor value to the content of the to the editor bound shared type.
   */
  synchronizeValue: (e: YjsEditor): void => {
    Editor.withoutNormalizing(e, () => {
      e.children = toSlateDoc(e.sharedType);
      e.onChange();
    });
  },

  /**
   * Returns whether the editor currently is applying remote changes.
   */
  sharedType: (editor: YjsEditor): SharedType => {
    const sharedType = SHARED_TYPES.get(editor);
    invariant(sharedType, 'YjsEditor without attached shared type');
    return sharedType;
  },

  /**
   * Returns whether the editor currently is applying remote changes.
   */
  isRemote: (editor: YjsEditor): boolean => {
    return IS_REMOTE.has(editor);
  },

  /**
   * Performs an action as a remote operation.
   */
  asRemote: (editor: YjsEditor, fn: () => void): void => {
    const wasRemote = YjsEditor.isRemote(editor);
    IS_REMOTE.add(editor);

    fn();

    if (!wasRemote) {
      IS_REMOTE.delete(editor);
    }
  },
};

function localOperations(editor: YjsEditor): Set<Operation> {
  const operations = LOCAL_OPERATIONS.get(editor);
  invariant(operations, 'YjsEditor without attached local operations');
  return operations;
}

function trackLocalOperations(editor: YjsEditor, operation: Operation): void {
  if (!YjsEditor.isRemote(editor)) {
    localOperations(editor).add(operation);
  }
}

/**
 * Applies a slate operations to the bound shared type.
 */
function applyLocalOperations(editor: YjsEditor): void {
  const editorLocalOperations = localOperations(editor);

  applySlateOps(
    YjsEditor.sharedType(editor),
    Array.from(editorLocalOperations),
    slateYjsSymbol
  );

  editorLocalOperations.clear();
}

/**
 * Apply Yjs events to slate
 */
function applyRemoteYjsEvents(editor: YjsEditor, events: Y.YEvent[]): void {
  Editor.withoutNormalizing(editor, () =>
    YjsEditor.asRemote(editor, () =>
      applyYjsEvents(
        editor,
        events.filter((event) => event.transaction.origin !== slateYjsSymbol)
      )
    )
  );
}

export function withYjs<T extends Editor>(
  editor: T,
  sharedType: SharedType,
  { synchronizeValue = true }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedType = sharedType;
  SHARED_TYPES.set(editor, sharedType);
  LOCAL_OPERATIONS.set(editor, new Set());

  if (synchronizeValue) {
    setTimeout(() => YjsEditor.synchronizeValue(e), 0);
  }

  sharedType.observeDeep((events) => applyRemoteYjsEvents(e, events));

  const { apply, onChange } = e;

  e.apply = (op: Operation) => {
    trackLocalOperations(e, op);

    apply(op);
  };

  e.onChange = () => {
    applyLocalOperations(e);

    onChange();
  };

  return e;
}

export type WithYjsOptions = {
  synchronizeValue?: boolean;
};
