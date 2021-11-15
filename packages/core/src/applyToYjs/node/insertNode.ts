import { InsertNodeOperation, Node, Text } from 'slate';
import * as Y from 'yjs';
import { slateElementToYText } from '../../utils/convert';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';

export function insertNode(
  root: Y.XmlText,
  slateRoot: Node,
  op: InsertNodeOperation
): void {
  const { parent, textRange } = getYTarget(root, slateRoot, op.path);

  if (Text.isText(op.node)) {
    return parent.insert(textRange.start, op.node.text, getProperties(op.node));
  }

  parent.insertEmbed(textRange.start, slateElementToYText(op.node));
}
