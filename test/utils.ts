import { Node, Text } from 'slate';
import * as Y from 'yjs';
import { SyncDoc, toSlateDoc, toSyncDoc } from '../src';

export function createText(text = ''): Text {
  return {
    text,
  };
}

export function createNode(
  type = 'paragraph',
  text = '',
  data?: Partial<Node>
): Node {
  return {
    type,
    children: [createText(text)],
    ...data,
  };
}

export function createValue(children?: Node[]): { children: Node[] } {
  return {
    children: children || [createNode()],
  };
}

export function createDoc(children?: Node[]): Y.Doc {
  const doc = new Y.Doc();
  toSyncDoc(doc.getArray('content'), createValue(children).children);
  return doc;
}

export function cloneDoc(doc: SyncDoc): Y.Doc {
  const clone = new Y.Doc();
  toSyncDoc(clone.getArray('content'), toSlateDoc(doc));
  return clone;
}

export function wait(ms = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
