import { Node, RemoveTextOperation } from 'slate';
import type Y from 'yjs';
import { invalidateDeltaCache } from '../../utils/delta';
import { getYTarget } from '../../utils/location';

export function removeText(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: RemoveTextOperation
): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path);

  yParent.delete(textRange.start + op.offset, op.text.length);
  invalidateDeltaCache(sharedRoot, yParent);
}
