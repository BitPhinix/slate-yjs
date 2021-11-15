import { Node, SplitNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { sliceInsertDelta } from '../../utils/delta';
import { getNodeLength, getYTarget } from '../../utils/location';

export function splitNode(
  root: Y.XmlText,
  slateRoot: Node,
  op: SplitNodeOperation
): void {
  const target = getYTarget(root, slateRoot, op.path);
  if (!target.targetNode) {
    throw new Error('Y target without corresponding slate node');
  }

  if (!target.target) {
    if (!Text.isText(target.targetNode)) {
      throw new Error('Mismatch node type between y target and slate node');
    }

    const unset: Record<string, null> = {};
    target.targetDelta.forEach((element) => {
      if (element.attributes) {
        Object.keys(element.attributes).forEach((key) => {
          unset[key] = null;
        });
      }
    });

    return target.parent.format(
      target.textRange.start,
      target.textRange.end - target.textRange.start,
      { ...unset, ...op.properties }
    );
  }

  if (Text.isText(target.targetNode)) {
    throw new Error('Mismatch node type between y target and slate node');
  }

  const splitTarget = getYTarget(target.target, target.targetNode, [
    op.position,
  ]);

  const ySplitOffset = target.targetNode.children
    .slice(0, op.position)
    .reduce((length, child) => length + getNodeLength(child), 0);

  const length = target.targetNode.children.reduce(
    (current, child) => current + getNodeLength(child),
    0
  );

  const splitDelta = sliceInsertDelta(
    target.target.toDelta() as InsertDelta,
    ySplitOffset,
    length - ySplitOffset
  );

  const toInsert = new Y.XmlText();
  toInsert.applyDelta(cloneInsertDeltaDeep(splitDelta), {
    sanitize: false,
  });

  Object.entries(op.properties).forEach(([key, value]) => {
    toInsert.setAttribute(key, value);
  });

  target.target.delete(
    splitTarget.textRange.start,
    target.target.length - splitTarget.textRange.start
  );

  return target.parent.insertEmbed(target.textRange.end, toInsert);
}
