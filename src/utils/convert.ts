import { Element, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { SyncDoc, SyncElement } from '../model';

/**
 * Converts a sync element to a slate node
 *
 * @param element
 */
export const toSlateNode = (element: SyncElement): Node => {
  const text = SyncElement.getText(element);
  const children = SyncElement.getChildren(element);

  const node: Partial<Node> = {};
  if (text !== undefined) {
    node.text = text.toString();
  }
  if (children !== undefined) {
    node.children = children.map(toSlateNode);
  }

  for (const [key, value] of element.entries()) {
    if (key !== 'children' && key !== 'text') {
      node[key] = value;
    }
  }

  return node as Node;
};

/**
 * Converts a SyncDoc to a Slate doc
 * @param doc
 */
export const toSlateDoc = (doc: SyncDoc): Node[] => {
  return doc.map(toSlateNode);
};

/**
 * Converts all elements int a Slate doc to SyncElements and adds them
 * to the SyncDoc
 *
 * @param syncDoc
 * @param doc
 */
export const toSyncDoc = (syncDoc: SyncDoc, doc: Node[]): void => {
  syncDoc.insert(0, doc.map(toSyncElement));
};

/**
 * Converts a slate node to a sync element
 *
 * @param node
 */
export const toSyncElement = (node: Node): SyncElement => {
  const element: SyncElement = new Y.Map();

  if (Element.isElement(node)) {
    const childElements = node.children.map(toSyncElement);
    const childContainer = new Y.Array();
    childContainer.insert(0, childElements);
    element.set('children', childContainer);
  }

  if (Text.isText(node)) {
    const textElement = new Y.Text(node.text);
    element.set('text', textElement);
  }

  for (const [key, value] of Object.entries(node)) {
    if (key !== 'children' && key !== 'text') {
      element.set(key, value);
    }
  }

  return element;
};

/**
 * Converts a SyncDoc path the a slate path
 *
 * @param path
 */
export const toSlatePath = (path: (string | number)[]): Path => {
  return path.filter(node => typeof node === 'number') as Path;
};
