import { MergeNodeOperation } from 'slate';
import invariant from 'tiny-invariant';
import { SharedType, SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils';

/**
 * Applies a merge node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function mergeNode(
  doc: SharedType,
  op: MergeNodeOperation
): SharedType {
  const [parent, index] = getParent(doc, op.path);

  const children = SyncNode.getChildren(parent);
  invariant(children, 'Parent of element should have children');

  const prev = children.get(index - 1);
  const next = children.get(index);

  const prevText = SyncNode.getText(prev);
  const nextText = SyncNode.getText(next);

  if (prevText && nextText) {
    prevText.insert(prevText.length, nextText.toString());
  } else {
    const nextChildren = SyncNode.getChildren(next);
    const prevChildren = SyncNode.getChildren(prev);

    invariant(nextChildren, 'Next element should have children');
    invariant(prevChildren, 'Prev element should have children');

    const toPush = nextChildren.map(cloneSyncElement);
    prevChildren.push(toPush);
  }

  children.delete(index, 1);
  return doc;
}
