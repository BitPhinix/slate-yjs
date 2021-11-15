import { Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { InsertDelta, TextRange } from '../model/types';
import { sliceInsertDelta } from './delta';

export function getNodeLength(node: Node): number {
  return Text.isText(node) ? node.text.length : 1;
}

export function getYTarget(
  yRoot: Y.XmlText,
  slateRoot: Node,
  path: Path
): {
  textRange: TextRange;
  parent: Y.XmlText;
  parentNode: Node;
  target?: Y.XmlText;
  targetNode?: Node;
  targetDelta: InsertDelta;
} {
  if (path.length === 0) {
    throw new Error('Path has to a have a length >= 1');
  }

  if (Text.isText(slateRoot)) {
    throw new Error('Cannot descent into slate text');
  }

  const [pathOffset, ...childPath] = path;

  let yOffset = 0;
  for (let i = 0; i < pathOffset; i++) {
    const element = slateRoot.children[i];

    if (!element) {
      throw new Error("Path doesn't match slate node, offset out of bounds");
    }

    yOffset += Text.isText(element) ? element.text.length : 1;
  }

  const targetNode = slateRoot.children[pathOffset];
  const delta = yRoot.toDelta() as InsertDelta;
  const targetLength = targetNode ? getNodeLength(targetNode) : 0;

  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength);
  if (targetDelta.length > 1) {
    throw new Error('YTarget spans more than one node');
  }

  const yTarget = targetDelta[0]?.insert;
  if (childPath.length > 0) {
    if (!(yTarget instanceof Y.XmlText)) {
      throw new Error(
        "Path doesn't match yText, cannot descent into non-yText"
      );
    }

    return getYTarget(yTarget, targetNode, childPath);
  }

  return {
    parent: yRoot,
    textRange: { start: yOffset, end: yOffset + targetLength },
    target: yTarget instanceof Y.XmlText ? yTarget : undefined,
    parentNode: slateRoot,
    targetNode,
    targetDelta,
  };
}
