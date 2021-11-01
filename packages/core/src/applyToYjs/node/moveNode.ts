import { Editor, MoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { Delta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
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
  const origin = getYTarget(root, editor, op.path);
  const target = getYTarget(root, editor, op.newPath);
  const insertDelta = cloneInsertDeltaDeep(origin.targetDelta);

  origin.parent.delete(
    origin.textRange.start,
    origin.textRange.end - origin.textRange.start
  );

  const insertOffset =
    origin.parent === target.parent &&
    origin.textRange.start < target.textRange.start
      ? target.textRange.start - (origin.textRange.end - origin.textRange.start)
      : target.textRange.start;

  const applyDelta: Delta = [{ retain: insertOffset }, ...insertDelta];
  target.parent.applyDelta(applyDelta, { sanitize: false });
}
