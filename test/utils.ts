import { Node } from 'slate';
import * as Y from 'yjs';
import { SyncDoc, toSlateDoc, toSyncDoc } from '../src';

export const createText = (text = '') => ({
  text
});

export const createNode = (
  type = 'paragraph',
  text = '',
  data?: { [key: string]: any }
) => ({
  type,
  children: [createText(text)],
  ...data
});

export const createValue = (children?: any): { children: Node[] } => ({
  children: children || [createNode()]
});

export const createDoc = (children?: any): Y.Doc => {
  const doc = new Y.Doc();
  toSyncDoc(doc.getArray('content'), createValue(children).children);
  return doc;
};

export const cloneDoc = (doc: SyncDoc): Y.Doc => {
  const clone = new Y.Doc();
  toSyncDoc(clone.getArray('content'), toSlateDoc(doc));
  return clone;
};
