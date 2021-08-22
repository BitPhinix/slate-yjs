import { createEditor, Node, Text } from 'slate';
import Y from 'yjs';
import { TestEditor, withTest } from './testEditor';
import { WithYjsOptions } from '../src/plugin';
import { SharedType } from '../src/model/sharedType';

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
  SharedType.slateDoc(doc.getArray('content'), createValue(children).children);
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

export async function createTestEditor(
  value?: Node[],
  options?: WithYjsOptions
): Promise<TestEditor> {
  const doc = new Y.Doc();
  const syncType = doc.getArray<SyncElement>('content');

  if (value) {
    toSharedType(syncType, value);
  }

  const editor = withTest(withYjs(createEditor(), syncType, options));

  // wait for value sync
  await wait();

  return editor;
}
