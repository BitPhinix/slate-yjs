import { InsertNodeOperation, Node, Text } from 'slate';
import * as Y from 'yjs';
import { slateElementToYText } from '../../utils/convert';
import { invalidateDeltaCacheForYText } from '../../utils/delta';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';

export function insertNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: InsertNodeOperation
): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path);

  if (Text.isText(op.node)) {
    yParent.insert(textRange.start, op.node.text, getProperties(op.node));
    return invalidateDeltaCacheForYText(yParent);
  }

  yParent.insertEmbed(textRange.start, slateElementToYText(op.node));
  invalidateDeltaCacheForYText(yParent);
}
