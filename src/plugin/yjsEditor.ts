import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { applySlateOps as applySlateOperations } from '../apply';
import { toSlateOps } from '../convert';
import { SyncDoc, SyncElement } from '../model';

export interface YjsEditor extends Editor {
  isRemote: boolean;
  doc: Y.Doc;
  syncDoc: SyncDoc;
}

const YjsEditor = {
  /**
   * Apply slate ops to Yjs
   */
  applySlateOps: (e: YjsEditor, operations: Operation[]) => {
    try {
      e.doc.transact(() => {
        applySlateOperations(e.syncDoc, operations);
      });
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Apply Yjs events to slate
   */
  applyEvents: (e: YjsEditor, events: Y.YEvent[]) => {
    const remoteEvents = events.filter((event) => !event.transaction.local);
    if (remoteEvents.length == 0) {
      return;
    }

    e.isRemote = true;

    Editor.withoutNormalizing(e, () => {
      toSlateOps(remoteEvents).forEach((op) => {
        e.apply(op);
      });
    });

    Promise.resolve().then(() => (e.isRemote = false));
  },
};

export const withYjs = <T extends Editor>(editor: T): T & YjsEditor => {
  const e = editor as T & YjsEditor;

  const doc = new Y.Doc();
  const syncDoc = doc.getArray<SyncElement>('content');

  syncDoc.observeDeep((events) => {
    YjsEditor.applyEvents(e, events);
  });

  e.doc = doc;
  e.syncDoc = syncDoc;
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
};
