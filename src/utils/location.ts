import { Element, Node, Path, Text } from 'slate';
import Y from 'yjs';
import { InsertDelta, TextRange } from '../model/types';
import { sliceInsertDelta } from './delta';

export function getNodeLength(node: Node): number {
  return Text.isText(node) ? node.text.length : 1;
}

export function getYTarget(
  root: Y.XmlText,
  node: Node,
  path: Path
): {
  textRange: TextRange;
  parent: Y.XmlText;
  parentNode: Node;
  target: Y.XmlText | undefined;
  targetNode: Node | undefined;
  targetDelta: InsertDelta;
} {
  if (path.length === 0) {
    throw new Error('Path has to a have a length >= 1');
  }

  if (!Element.isElement(node)) {
    throw new Error('Cannot descent into slate text');
  }

  const [pathOffset, ...childPath] = path;

  let yOffset = 0;
  for (let i = 0; i < pathOffset; i++) {
    const element = node.children[i];

    if (!element) {
      throw new Error("Path doesn't match slate node, offset out of bounds");
    }

    yOffset += Text.isText(element) ? element.text.length : 1;
  }

  const targetNode = node.children[pathOffset];
  const delta = root.toDelta() as InsertDelta;
  const targetLength = targetNode ? getNodeLength(targetNode) : 0;

  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength);
  if (targetDelta.length > 1) {
    throw new Error('YTarget spans more than one node');
  }

  const yTarget = targetDelta[0]?.insert;
  if (childPath.length > 0) {
    if (!(yTarget instanceof Y.XmlText)) {
      throw new Error('Cannot descent into yText');
    }

    return getYTarget(yTarget, targetNode, childPath);
  }

  return {
    parent: root,
    textRange: { start: yOffset, end: yOffset + targetLength },
    target: yTarget instanceof Y.XmlText ? yTarget : undefined,
    parentNode: node,
    targetNode,
    targetDelta,
  };
}
