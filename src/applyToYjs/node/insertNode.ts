import { Editor, InsertNodeOperation, Text } from 'slate';
import Y from 'yjs';
import { InsertDelta, isSyncLeaf, SharedType } from '../../model/types';
import { toSyncDescendants } from '../../utils/convert';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies an insert node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function insertNode(
  sharedType: SharedType,
  editor: Editor,
  op: InsertNodeOperation
): void {
  const { element, parent, textRange, pathOffset } = getYTarget(
    sharedType,
    editor,
    op.path
  );

  if (textRange && Text.isText(op.node)) {
    if (!isSyncLeaf(element)) {
      throw new Error('Cannot insert with text range into non-leaf');
    }

    return element.insert(
      textRange.startOffset,
      op.node.text,
      getMarks(op.node)
    );
  }

  // Since the path points to where the element should be inserted = the next element,
  // we have a choice between inserting before the current or at the end of the last
  // (if it's a leaf group). In this case, always prefer the leaf group for text nodes.
  if (Text.isText(op.node) && pathOffset > 0) {
    const previousSibling = parent.get(pathOffset - 1);

    if (isSyncLeaf(previousSibling)) {
      return previousSibling.insert(
        previousSibling.length,
        op.node.text,
        getMarks(op.node)
      );
    }
  }

  if (!textRange) {
    return parent.insert(pathOffset, toSyncDescendants([op.node]));
  }

  // Insert splits leaf group
  if (!isSyncLeaf(element)) {
    throw new Error('Cannot insert with text range into non-leaf');
  }

  const delta = element.toDelta() as InsertDelta;
  let currentOffset = 0;
  const splitIdx = delta.findIndex(({ insert }) => {
    if (currentOffset === textRange.startOffset) {
      return true;
    }

    currentOffset += insert.length;
    return false;
  });

  // This should technically never happen since getTarget shouldn't return a offset that's in
  // the middle of a slate leaf.
  if (splitIdx === -1) {
    throw new Error('Node insert splits leaf node');
  }

  element.delete(textRange.startOffset, element.length - textRange.startOffset);

  const splitLeaf = new Y.XmlText();
  splitLeaf.applyDelta(delta.slice(splitIdx));

  return parent.insert(pathOffset, [
    ...toSyncDescendants([op.node]),
    splitLeaf,
  ]);
}
