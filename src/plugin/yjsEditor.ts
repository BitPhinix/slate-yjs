import { Editor, Operation } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applySlateOps } from '../apply';
import { toSlateOps } from '../convert';
import { SharedType } from '../model';
import { toSlateDoc } from '../utils/convert';

export interface YjsEditor extends Editor {
  isRemote: boolean;
  isLocal: boolean;
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
   * Apply slate ops to Yjs
   */
  applySlateOps: (e: YjsEditor, operations: Operation[]): void => {
    invariant(e.sharedType.doc, 'shared type is not bound to a document');

    e.isLocal = true;

    e.sharedType.doc.transact(() => {
      applySlateOps(e.sharedType, operations);
    });

    // eslint-disable-next-line no-return-assign
    Promise.resolve().then(() => (e.isLocal = false));
  },

  /**
   * Apply Yjs events to slate
   */
  applyYJsEvents: (e: YjsEditor, events: Y.YEvent[]): void => {
    e.isRemote = true;

    Editor.withoutNormalizing(e, () => {
      toSlateOps(events).forEach((op) => {
        e.apply(op);
      });
    });

    // eslint-disable-next-line no-return-assign
    Promise.resolve().then(() => (e.isRemote = false));
  },
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedType: SharedType
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedType = sharedType;
  e.isRemote = false;
  e.isLocal = false;

  setTimeout(() => {
    YjsEditor.synchronizeValue(e);
  });

  sharedType.observeDeep((events) => {
    if (!e.isLocal) {
      YjsEditor.applyYJsEvents(e, events);
    }
  });

  const { onChange } = editor;

  e.onChange = () => {
    if (!e.isRemote) {
      YjsEditor.applySlateOps(e, e.operations);
    }

    if (onChange) {
      onChange();
    }
  };

  return e;
}
