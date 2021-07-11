import { Editor, Operation } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { SharedType } from '../model';
import { toSlateDoc } from '../utils/convert';

const IS_REMOTE: WeakSet<Editor> = new WeakSet();
const IS_LOCAL: WeakSet<Editor> = new WeakSet();
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
   * Applies a slate operations to the bound shared type.
   */
  applySlateOperations: (editor: YjsEditor, operations: Operation[]): void => {
    YjsEditor.asLocal(editor, () => {
      applySlateOps(YjsEditor.sharedType(editor), operations);
    });
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
      Promise.resolve().then(() => IS_REMOTE.delete(editor));
    }
  },

  /**
   * Apply Yjs events to slate
   */
  applyYjsEvents: (editor: YjsEditor, events: Y.YEvent[]): void => {
    YjsEditor.asRemote(editor, () => {
      applyYjsEvents(editor, events);
    });
  },

  /**
   * Performs an action as a local operation.
   */
  asLocal: (editor: YjsEditor, fn: () => void): void => {
    const wasLocal = YjsEditor.isLocal(editor);
    IS_LOCAL.add(editor);

    fn();

    if (!wasLocal) {
      IS_LOCAL.delete(editor);
    }
  },

  /**
   * Returns whether the editor currently is applying a remote change to the yjs doc.
   */
  isLocal: (editor: YjsEditor): boolean => {
    return IS_LOCAL.has(editor);
  },
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedType: SharedType
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedType = sharedType;
  SHARED_TYPES.set(editor, sharedType);

  setTimeout(() => {
    YjsEditor.synchronizeValue(e);
  });

  sharedType.observeDeep((events) => {
    if (!YjsEditor.isLocal(e)) {
      YjsEditor.applyYjsEvents(e, events);
    }
  });

  const { onChange } = editor;

  e.onChange = () => {
    if (!YjsEditor.isRemote(e)) {
      YjsEditor.applySlateOperations(e, e.operations);
    }

    onChange();
  };

  return e;
}
