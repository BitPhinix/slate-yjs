import { Editor, RemoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { getYTarget } from '../../utils/location';

/**
 * Applies a remove node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function removeNode(
  root: Y.XmlText,
  editor: Editor,
  op: RemoveNodeOperation
): void {
  const { parent, textRange } = getYTarget(root, editor, op.path);
  parent.delete(textRange.start, textRange.end - textRange.start);
}
