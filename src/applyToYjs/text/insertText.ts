import { Editor, InsertTextOperation, Node } from 'slate';
import { isSyncLeaf, SharedType } from '../../model/types';
import { getTarget } from '../../utils/location';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { text, ...attributes } = Node.get(editor, op.path);
  const [syncLeaf, startOffset] = getTarget(sharedType, op.path);

  if (!isSyncLeaf(syncLeaf)) {
    throw new Error('Operation does not point to a leaf');
  }

  syncLeaf.insert(startOffset + op.offset, op.text, attributes);
}
