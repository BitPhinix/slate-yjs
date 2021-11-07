import { Editor, MoveNodeOperation, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { getInsertDeltaLength } from '../../utils/delta';
import { getYTarget } from '../../utils/location';

/**
 * Applies a move node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function moveNode(
  root: Y.XmlText,
  editor: Editor,
  op: MoveNodeOperation
): void {
  const newParentPath = Path.parent(op.newPath);
  const newPathOffset = op.newPath[op.newPath.length - 1];
  const parent = Node.get(editor, newParentPath);
  if (Text.isText(parent)) {
    throw new Error('Cannot move slate node into text element');
  }
  const normalizedNewPath = [
    ...newParentPath,
    Math.min(newPathOffset, parent.children.length),
  ];

  const origin = getYTarget(root, editor, op.path);
  const target = getYTarget(root, editor, normalizedNewPath);
  const insertDelta = cloneInsertDeltaDeep(origin.targetDelta);

  origin.parent.delete(
    origin.textRange.start,
    origin.textRange.end - origin.textRange.start
  );

  const targetLength = getInsertDeltaLength(
    target.parent.toDelta() as InsertDelta
  );

  const applyDelta: Delta = [
    { retain: Math.min(target.textRange.start, targetLength) },
    ...insertDelta,
  ];

  target.parent.applyDelta(applyDelta, { sanitize: false });
}
