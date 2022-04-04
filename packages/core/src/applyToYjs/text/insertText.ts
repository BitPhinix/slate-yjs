import { InsertTextOperation, Node, Text } from 'slate';
import type Y from 'yjs';
import { invalidateDeltaCache } from '../../utils/delta';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';

export function insertText(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: InsertTextOperation
): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path);

  const targetNode = Node.get(slateRoot, op.path);
  if (!Text.isText(targetNode)) {
    throw new Error('Cannot insert text into non-text node');
  }

  yParent.insert(
    textRange.start + op.offset,
    op.text,
    getProperties(targetNode)
  );

  invalidateDeltaCache(sharedRoot, yParent);
}
