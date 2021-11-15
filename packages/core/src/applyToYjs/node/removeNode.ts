import { Node, RemoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { getYTarget } from '../../utils/location';

export function removeNode(
  root: Y.XmlText,
  slateRoot: Node,
  op: RemoveNodeOperation
): void {
  const { parent, textRange } = getYTarget(root, slateRoot, op.path);
  parent.delete(textRange.start, textRange.end - textRange.start);
}
