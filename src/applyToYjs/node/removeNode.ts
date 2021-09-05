import { Editor, RemoveNodeOperation } from 'slate';
import { isSyncLeaf, SharedType } from '../../model/types';
import { getYTarget } from '../../utils/location';

/**
 * Applies a remove node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function removeNode(
  sharedType: SharedType,
  editor: Editor,
  op: RemoveNodeOperation
): void {
  const { element, parent, textRange, pathOffset } = getYTarget(
    sharedType,
    editor,
    op.path
  );

  if (textRange) {
    if (!isSyncLeaf(element)) {
      throw new Error('Cannot delete text range from non-leaf');
    }

    // TODO: Don't delete if there is a direct sibling with the same marks
    // If the delete spans the entire leaf group, remove it
    if (textRange.startOffset !== 0 || textRange.endOffset !== element.length) {
      return element.delete(
        textRange.startOffset,
        textRange.endOffset - textRange.startOffset
      );
    }
  }

  parent.delete(pathOffset);

  if (pathOffset === 0 || pathOffset === parent.length - 2) {
    return;
  }

  const nextSibling = parent.get(pathOffset);
  if (!isSyncLeaf(nextSibling)) {
    return;
  }

  const previousSibling = parent.get(pathOffset - 1);
  if (!isSyncLeaf(previousSibling)) {
    return;
  }

  // Normalize the document if the delete results in 2 leafs next to each other.
  // TODO: Check if this is worth it since it could result in unexpected behaviour.
  parent.delete(pathOffset);
  previousSibling.applyDelta(
    [{ offset: previousSibling.length }, ...nextSibling.toDelta()],
    { sanitize: false }
  );
}
