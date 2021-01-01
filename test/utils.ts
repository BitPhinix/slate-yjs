import { createEditor, Node, Text } from 'slate';
import * as Y from 'yjs';
import {
  SharedType,
  SyncElement,
  toSharedType,
  toSlateDoc,
  withYjs,
} from '../src';
import { TestEditor, withTest } from './testEditor';

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
  toSharedType(doc.getArray('content'), createValue(children).children);
  return doc;
}

export function cloneDoc(doc: SharedType): Y.Doc {
  const clone = new Y.Doc();
  toSharedType(clone.getArray('content'), toSlateDoc(doc));
  return clone;
}

export function wait(ms = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createTestEditor(value?: Node[]): TestEditor {
  const doc = new Y.Doc();
  const syncType = doc.getArray<SyncElement>('content');

  if (value) {
    toSharedType(syncType, value);
  }

  return withTest(withYjs(createEditor(), syncType));
}
