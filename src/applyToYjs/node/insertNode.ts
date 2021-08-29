import { InsertNodeOperation, Text } from 'slate';
import { isSyncLeaf, SharedType } from '../../model/types';
import { toSyncDescendants } from '../../utils/convert';
import { getTarget, toYPathOffset } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies an insert node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function insertNode(
  sharedType: SharedType,
  op: InsertNodeOperation
): void {
  const parentPath = op.path.slice(0, -1);
  const index = op.path[op.path.length - 1];

  const [parentSyncElement] = getTarget(sharedType, parentPath);

  if (isSyncLeaf(parentSyncElement)) {
    throw new Error('Cannot apply insert node operation to sync text');
  }

  // If we insert a text node, always try to attach it to a neighboring leaf group if
  // possible
  if (Text.isText(op.node)) {
    if (index > 0) {
      const [previous, offset] = getTarget(parentSyncElement, [index - 1], {
        edge: 'end',
      });

      if (isSyncLeaf(previous)) {
        return previous.insert(offset, op.node.text, getMarks(op.node));
      }
    }

    const nextEntry = getTarget(parentSyncElement, [index], {
      throwInvalid: false,
    });

    if (nextEntry && isSyncLeaf(nextEntry[0])) {
      return nextEntry[0].insert(0, op.node.text, getMarks(op.node));
    }
  }

  const [pathOffset] = toYPathOffset(parentSyncElement, index);
  return parentSyncElement.insert(pathOffset, toSyncDescendants([op.node]));
}
