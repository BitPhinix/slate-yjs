import { MoveNodeOperation } from 'slate';
import invariant from 'tiny-invariant';
import { SharedType, SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils';

/**
 * Applies a move node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function moveNode(
  doc: SharedType,
  op: MoveNodeOperation
): SharedType {
  const [from, fromIndex] = getParent(doc, op.path);
  const [to, toIndex] = getParent(doc, op.newPath);

  if (
    SyncNode.getText(from) !== undefined ||
    SyncNode.getText(to) !== undefined
  ) {
    throw new TypeError("Can't move node as child of a text node");
  }

  const fromChildren = SyncNode.getChildren(from);
  const toChildren = SyncNode.getChildren(to);

  invariant(fromChildren, 'From element should not be a text node');
  invariant(toChildren, 'To element should not be a text node');

  const toMove = fromChildren.get(fromIndex);
  const toInsert = cloneSyncElement(toMove);

  fromChildren.delete(fromIndex);
  toChildren.insert(Math.min(toIndex, toChildren.length), [toInsert]);

  return doc;
}
