import { Node, RemoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { invalidateDeltaCache } from '../../utils/delta';
import { getYTarget } from '../../utils/location';

export function removeNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: RemoveNodeOperation
): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path);
  yParent.delete(textRange.start, textRange.end - textRange.start);
  invalidateDeltaCache(sharedRoot, yParent);
}
