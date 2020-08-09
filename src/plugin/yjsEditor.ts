import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { applySlateOps as applySlateOperations } from '../apply';
import { toSlateOps } from '../convert';
import { SyncDoc, SyncElement } from '../model';

export interface YJsEditor extends Editor {
  isRemote: boolean;
  doc: Y.Doc;
  syncDoc: SyncDoc;
}

const YJsEditor = {
  /**
   * Apply slate ops to YJs
   */
  applySlateOps: (e: YJsEditor, operations: Operation[]) => {
    try {
      e.doc.transact(() => {
        applySlateOperations(e.syncDoc, operations);
      });
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Apply YJs events to slate
   */
  applyEvents: (e: YJsEditor, events: Y.YEvent[]) => {
    const remoteEvents = events.filter(event => !event.transaction.local);
    if (remoteEvents.length == 0) {
      return;
    }

    e.isRemote = true;

    Editor.withoutNormalizing(e, () => {
      toSlateOps(remoteEvents).forEach(op => {
        e.apply(op);
      });
    });

    Promise.resolve().then(() => (e.isRemote = false));
  }
};

export const withYJs = <T extends Editor>(editor: T): T & YJsEditor => {
  const e = editor as T & YJsEditor;

  const doc = new Y.Doc();
  const syncDoc = doc.getArray<SyncElement>('content');

  syncDoc.observeDeep(events => {
    YJsEditor.applyEvents(e, events);
  });

  e.doc = doc;
  e.syncDoc = syncDoc;
  e.isRemote = false;

  const { onChange } = editor;
  e.onChange = () => {
    if (!e.isRemote) {
      YJsEditor.applySlateOps(e, e.operations);
    }

    if (onChange) {
      onChange();
    }
  };

  return e;
};
