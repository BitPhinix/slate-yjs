import { Editor, InsertTextOperation, Node, Text } from 'slate';
import type Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';

/**
 * Applies a insert text operation to a Y.XmlText
 *
 * @param doc
 * @param op
 */
export function insertText(
  root: Y.XmlText,
  editor: Editor,
  op: InsertTextOperation
): void {
  const { parent: target, textRange } = getYTarget(root, editor, op.path);

  const targetNode = Node.get(editor, op.path);
  if (!Text.isText(targetNode)) {
    throw new Error('Cannot insert text into non-text node');
  }

  target.insert(
    textRange.start + op.offset,
    op.text,
    getProperties(targetNode)
  );
}
