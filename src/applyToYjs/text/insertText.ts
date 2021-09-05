import { Editor, InsertTextOperation, Node, Text } from 'slate';
import { isSyncLeaf, SharedType } from '../../model/types';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies a insert text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export function insertText(
  sharedType: SharedType,
  editor: Editor,
  op: InsertTextOperation
): void {
  const { element, textRange } = getYTarget(sharedType, editor, op.path);

  if (!isSyncLeaf(element) || !textRange) {
    throw new Error('Cannot insert text into a non-leaf');
  }

  const targetNode = Node.get(editor, op.path);
  if (!Text.isText(targetNode)) {
    throw new Error('Cannot insert text into non-text node');
  }
  const marks = getMarks(targetNode);

  return element.insert(textRange.startOffset + op.offset, op.text, marks);
}
