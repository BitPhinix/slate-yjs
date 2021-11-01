import { createEditor, Node, Text } from 'slate';
import * as Y from 'yjs';
import { TestEditor, withTest } from './testEditor';
import { withYjs, WithYjsOptions } from '../src';
import { slateNodesToInsertDelta } from '../src/utils/convert';

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
  const insertDelta = slateNodesToInsertDelta(createValue(children).children);

  const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
  sharedRoot.applyDelta(insertDelta, { sanitize: false });

  return doc;
}

export function wait(ms = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function createTestEditor(
  value?: Node[],
  options?: WithYjsOptions
): Promise<TestEditor> {
  const doc = new Y.Doc();

  const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;

  if (value) {
    const insertDelta = slateNodesToInsertDelta(value);
    sharedRoot.applyDelta(insertDelta, { sanitize: false });
  }

  const editor = withTest(withYjs(createEditor(), sharedRoot, options));

  // wait for value sync
  await wait();

  return editor;
}
