import { Editor, InsertNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { slateElementToYText } from '../../utils/convert';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies an insert node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function insertNode(
  root: Y.XmlText,
  editor: Editor,
  op: InsertNodeOperation
): void {
  const { parent, textRange } = getYTarget(root, editor, op.path);

  if (Text.isText(op.node)) {
    return parent.insert(textRange.start, op.node.text, getMarks(op.node));
  }

  parent.insertEmbed(textRange.start, slateElementToYText(op.node));
}
