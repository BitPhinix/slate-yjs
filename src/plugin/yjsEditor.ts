import { Editor, Operation } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applySlateOps } from '../apply';
import { toSlateOps } from '../convert';
import { SharedType } from '../model';

export interface YjsEditor extends Editor {
  isRemote: boolean;
  sharedType: SharedType;
}

export const YjsEditor = {
  /**
   * Apply slate ops to Yjs
   */
  applySlateOps: (e: YjsEditor, operations: Operation[]): void => {
    invariant(e.sharedType.doc, 'shared type is not bound to a document');

    e.sharedType.doc.transact(() => {
      applySlateOps(e.sharedType, operations);
    });
  },

  /**
   * Apply Yjs events to slate
   */
  applyEvents: (e: YjsEditor, events: Y.YEvent[]): void => {
    const remoteEvents = events.filter((event) => !event.transaction.local);
    if (remoteEvents.length === 0) {
      return;
    }

    e.isRemote = true;

    Editor.withoutNormalizing(e, () => {
      toSlateOps(remoteEvents).forEach((op) => {
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

  sharedType.observeDeep((events) => {
    YjsEditor.applyEvents(e, events);
  });

  e.sharedType = sharedType;
  e.isRemote = false;

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
