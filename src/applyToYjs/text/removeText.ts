import { Editor, RemoveTextOperation } from 'slate';
import { isSyncLeaf, SharedType } from '../../model/types';
import { getYTarget } from '../../utils/location';

/**
 * Applies a insert text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export function removeText(
  sharedType: SharedType,
  editor: Editor,
  op: RemoveTextOperation
): void {
  const { element, textRange } = getYTarget(sharedType, editor, op.path);

  if (!isSyncLeaf(element) || !textRange) {
    throw new Error('Cannot delete text from a non-leaf element');
  }

  if (textRange.endOffset < op.offset + op.text.length) {
    throw new Error('Cannot delete across leafs');
  }

  return element.delete(textRange.startOffset + op.offset, op.text.length);
}
