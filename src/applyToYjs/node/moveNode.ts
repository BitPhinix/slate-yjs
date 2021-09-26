import { Editor, MoveNodeOperation } from 'slate';
import Y from 'yjs';
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
  origin.parent.delete(
    origin.textRange.start,
    origin.textRange.end - origin.textRange.start
  );

  const target = getYTarget(root, editor, op.path);
  const applyDelta: Delta = [
    { retain: target.textRange.start },
    ...cloneInsertDeltaDeep(origin.targetDelta),
  ];

  target.parent.applyDelta(applyDelta, { sanitize: false });
}
