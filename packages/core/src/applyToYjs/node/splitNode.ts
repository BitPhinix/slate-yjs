import { Editor, Path, SplitNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { yTextToSlateElement } from '../../utils/convert';
import { sliceInsertDelta } from '../../utils/delta';
import { getNodeLength, getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies a split node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function splitNode(
  root: Y.XmlText,
  editor: Editor,
  op: SplitNodeOperation
): void {
  const target = getYTarget(root, editor, op.path);
  if (!target.targetNode) {
    throw new Error('Y target without corresponding slate node');
  }

  if (!target.target) {
    if (!Text.isText(target.targetNode)) {
      throw new Error('Mismatch node type between y target and slate node');
    }

    const parent = getYTarget(root, editor, Path.parent(op.path));
    const split = new Y.XmlText();

    const insertDelta = sliceInsertDelta(
      target.parent.toDelta(),
      target.textRange.start + op.position,
      target.textRange.end - target.textRange.start - op.position
    );

    split.applyDelta(insertDelta, { sanitize: false });
    Object.entries(op.properties).forEach(([key, value]) => {
      split.setAttribute(key, value);
    });

    target.parent.delete(
      target.textRange.start + op.position,
      target.textRange.end - target.textRange.start - op.position
    );

    return parent.parent.insertEmbed(parent.textRange.end, split);
  }

  const splitTarget = getYTarget(target.target, target.targetNode, [
    op.position,
  ]);
  const splitDelta = sliceInsertDelta(
    splitTarget.targetDelta,
    splitTarget.textRange.start,
    target.target.length - splitTarget.textRange.start
  );

  target.target.delete(
    splitTarget.textRange.start,
    target.target.length - splitTarget.textRange.start
  );

  const split = new Y.XmlText();
  split.applyDelta(cloneInsertDeltaDeep(splitDelta), { sanitize: false });

  Object.entries(op.properties).forEach(([key, value]) => {
    split.setAttribute(key, value);
  });

  return target.parent.insertEmbed(target.textRange.end, split);
}
