import { Editor, RemoveTextOperation } from 'slate';
import type Y from 'yjs';
import { getYTarget } from '../../utils/location';

/**
 * Applies a remove text operation to a Y.XmlText
 *
 * @param doc
 * @param op
 */
export function removeText(
  root: Y.XmlText,
  editor: Editor,
  op: RemoveTextOperation
): void {
  const { parent: target, textRange } = getYTarget(root, editor, op.path);
  target.delete(textRange.start + op.offset, op.text.length);
}
